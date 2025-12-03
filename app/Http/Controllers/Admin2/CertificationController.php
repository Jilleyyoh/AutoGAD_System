<?php

namespace App\Http\Controllers\Admin2;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Certificate;
use App\Models\CertificateStatus;
use App\Models\Notification;
use App\Models\ScoreInterpretation;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificationController extends Controller
{
    /**
     * Display list of completed evaluations ready for certification
     */
    public function index(Request $request)
    {
        try {
            // Get all projects with completed evaluations (status_id = 1 = completed)
            $projects = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'evaluations' => function ($query) {
                        $query->where('status_id', 3); // Approved evaluations (status id 3)
                    }
            ])
            ->whereHas('evaluations', function ($query) {
                $query->where('status_id', 3); // Has approved evaluations
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

            // Fetch score interpretations for frontend
            $interpretations = ScoreInterpretation::orderBy('score_min')->get()
                ->map(function ($interp) {
                    return [
                        'min' => (float)$interp->score_min,
                        'max' => (float)$interp->score_max,
                        'interpretation' => $interp->interpretation,
                        'description' => $interp->description,
                    ];
                })->toArray();

            // Transform data for frontend
            $projectsData = $projects->map(function ($project) {
                $completedEvaluations = $project->evaluations->where('status_id', 3);
                $averageScore = $completedEvaluations->count() > 0
                    ? $completedEvaluations->avg('total_score')
                    : null;

                // Get certificate if exists
                $certificate = Certificate::where('project_id', $project->id)->first();

                $statusName = $project->projectStatus?->name ?? 'Unknown';
                if ($statusName === 'for_correction') {
                    $statusName = 'revision';
                }

                return [
                    'id' => $project->id,
                    'project_code' => $project->project_code,
                    'title' => $project->project_title,
                    'organization' => $project->proponent?->organization ?? 'N/A',
                    'domain' => $project->domainExpertise?->domain_name ?? 'N/A',
                    'phase' => $project->implementationPhase?->name ?? 'N/A',
                    'average_score' => $averageScore ? (float)$averageScore : null,
                    'status' => $statusName,
                    'status_id' => $project->project_status_id,
                    'completion_date' => $project->updated_at?->format('Y-m-d'),
                    'is_certified' => $certificate !== null,
                    'certificate_id' => $certificate?->id,
                    'certificate_number' => $certificate?->certificate_number,
                ];
            })->toArray();

            return Inertia::render('admin2/certifications/index', [
                'projects' => $projectsData,
                'pagination' => [
                    'total' => $projects->total(),
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                ],
                'interpretations' => $interpretations,
                'max_score' => 20,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching certifications', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to load certifications');
        }
    }

    /**
     * Show certification details for a specific project
     */
    public function show($projectId)
    {
        try {
            $project = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'evaluations' => function ($query) {
                    $query->where('status_id', 3)
                          ->with('evaluator.user', 'interpretation');
                },
                'documents.documentType',
                'certificate'
            ])->findOrFail($projectId);

            // Get all evaluations with detailed scores
            $evaluations = $project->evaluations->map(function ($evaluation) {
                // Get scores by category
                $scoresByCategory = $evaluation->scores()
                    ->with('questionnaireItem.category')
                    ->get()
                    ->groupBy('questionnaireItem.category_id')
                    ->map(function ($categoryScores) {
                        $categoryId = $categoryScores->first()->questionnaireItem->category_id;
                        $categoryName = $categoryScores->first()->questionnaireItem->category?->category_name;
                        $categoryTotal = $categoryScores->sum('score');

                        return [
                            'category_id' => $categoryId,
                            'category_name' => $categoryName,
                            'subtotal' => (float)$categoryTotal,
                            'items' => $categoryScores->map(function ($score) {
                                return [
                                    'question' => $score->questionnaireItem->question,
                                    'score' => (float)$score->score,
                                    'remarks' => $score->remarks,
                                ];
                            })->toArray(),
                        ];
                    })->values()->toArray();

                // Get version information
                $versionData = null;
                if ($evaluation->questionnaireVersion) {
                    $versionData = [
                        'id' => $evaluation->questionnaireVersion->id,
                        'version_number' => $evaluation->questionnaireVersion->version_number,
                        'status' => $evaluation->questionnaireVersion->status,
                        'is_active' => $evaluation->questionnaireVersion->is_active,
                        'created_at' => $evaluation->questionnaireVersion->created_at?->toIso8601String(),
                        'description' => $evaluation->questionnaireVersion->description,
                    ];
                }

                return [
                    'id' => $evaluation->id,
                    'evaluator_name' => $evaluation->evaluator->user->name,
                    'evaluator_email' => $evaluation->evaluator->user->email,
                    'total_score' => $evaluation->total_score ? (float)$evaluation->total_score : null,
                    'interpretation' => $evaluation->interpretation?->interpretation,
                    'final_remarks' => $evaluation->final_remarks,
                    'completion_date' => $evaluation->completion_date?->format('Y-m-d H:i:s'),
                    'scores_by_category' => $scoresByCategory,
                    'questionnaire_version' => $versionData,
                ];
            })->toArray();

            // Calculate consolidated score
            $averageScore = count($evaluations) > 0
                ? array_sum(array_column($evaluations, 'total_score')) / count($evaluations)
                : null;

            // Get interpretation based on average score
            $interpretation = null;
            if ($averageScore) {
                $interpretation = ScoreInterpretation::where('score_min', '<=', $averageScore)
                    ->where('score_max', '>=', $averageScore)
                    ->first(['interpretation', 'description']);
            }

            // Fetch score interpretations for frontend
            $interpretations = ScoreInterpretation::orderBy('score_min')->get()
                ->map(function ($interp) {
                    return [
                        'min' => (float)$interp->score_min,
                        'max' => (float)$interp->score_max,
                        'interpretation' => $interp->interpretation,
                        'description' => $interp->description,
                    ];
                })->toArray();

            $projectStatusName = $project->projectStatus?->name ?? 'Unknown';
            if ($projectStatusName === 'for_correction') {
                $projectStatusName = 'revision';
            }

            $projectData = [
                'id' => $project->id,
                'project_code' => $project->project_code,
                'title' => $project->project_title,
                'description' => $project->project_description,
                'organization' => $project->proponent?->organization ?? 'N/A',
                'proponent_name' => $project->proponent?->user?->name ?? 'N/A',
                'proponent_email' => $project->proponent?->user?->email ?? 'N/A',
                'domain' => $project->domainExpertise?->domain_name ?? 'N/A',
                'phase' => $project->implementationPhase?->name ?? 'N/A',
                'status' => $projectStatusName,
                'submission_date' => $project->created_at?->format('Y-m-d'),
            ];

            $documents = $project->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'description' => $doc->description,
                    'document_type' => $doc->documentType?->name ?? 'Unknown',
                    'upload_date' => $doc->upload_date?->format('Y-m-d'),
                    'file_path' => $doc->file_path,
                    'drive_link' => $doc->drive_link,
                ];
            })->toArray();

            $certificateData = null;
            if ($project->certificate) {
                $certificateData = [
                    'id' => $project->certificate->id,
                    'certificate_number' => $project->certificate->certificate_number,
                    'issued_date' => $project->certificate->issued_date?->format('Y-m-d'),
                    'issued_by' => $project->certificate->issuedBy?->name ?? 'System',
                ];
            }

            return Inertia::render('admin2/certifications/show', [
                'project' => $projectData,
                'evaluations' => $evaluations,
                'average_score' => $averageScore ? (float)$averageScore : null,
                'evaluation_count' => count($evaluations),
                'interpretation' => $interpretation ? [
                    'interpretation' => $interpretation->interpretation,
                    'description' => $interpretation->description,
                ] : null,
                'interpretations' => $interpretations,
                'documents' => $documents,
                'certificate' => $certificateData,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error loading certification details', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to load certification details');
        }
    }

    /**
     * Generate certificate for a project
     */
    public function generate(Request $request, $projectId)
    {
        $request->validate([
            'confirmation_remarks' => 'nullable|string',
        ]);

        try {
            $project = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'evaluations' => function ($query) {
                        $query->where('status_id', 3);
                    }
            ])->findOrFail($projectId);

            // Check if certificate already exists
            $existingCert = Certificate::where('project_id', $projectId)->first();
            if ($existingCert) {
                return response()->json([
                    'message' => 'Certificate already exists for this project',
                    'certificate_id' => $existingCert->id
                ]);
            }

            // Calculate average score
            $completedEvaluations = $project->evaluations->where('status_id', 3);
            $averageScore = $completedEvaluations->count() > 0
                ? $completedEvaluations->avg('total_score')
                : null;

            DB::transaction(function () use ($project, $averageScore, $request) {
                // Generate certificate number (CERT-YYYY-MM-XXXX format)
                $certNumber = 'CERT-' . date('Y-m') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                // Get the first completed evaluation ID
                $firstEvaluation = $project->evaluations->where('status_id', 3)->first();
                $evaluationId = $firstEvaluation ? $firstEvaluation->id : null;

                // Create certificate record
                $certificate = Certificate::create([
                    'project_id' => $project->id,
                    'evaluation_id' => $evaluationId,
                    'certificate_code' => $certNumber,
                    'certificate_number' => $certNumber,
                    'issued_date' => now(),
                    'issued_by' => auth()->id(),
                    'status_id' => 1, // Active
                    'remarks' => $request->input('confirmation_remarks'),
                ]);

                // Update project status to certified (status_id = 7)
                $project->update([
                    'project_status_id' => 7,
                ]);

                // Send notifications to all roles using NotificationService
                NotificationService::notifyProponentCertificateGenerated($project);
                NotificationService::notifyEvaluatorCertificateGenerated($project);
                NotificationService::notifyAdmin1CertificateGenerated($project);
            });

            return response()->json([
                'message' => 'Certificate generated successfully',
                'redirect' => route('admin2.certifications.show', $projectId)
            ]);
        } catch (\Exception $e) {
            \Log::error('Error generating certificate', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error generating certificate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download certificate PDF
     */
    public function download($certificateId)
    {
        try {
            $certificate = Certificate::with([
                'project.proponent.user',
                'project.domainExpertise',
                'project.implementationPhase',
                'project.projectStatus',
                'project.evaluations' => function ($query) {
                    $query->where('status_id', 3)
                          ->with('evaluator.user', 'interpretation', 'scores.questionnaireItem.category', 'questionnaireVersion');
                },
                'issuedBy'
            ])->findOrFail($certificateId);

            // Verify project has completed evaluations
            if ($certificate->project->evaluations->isEmpty()) {
                abort(403, 'No completed evaluations for this project');
            }

            // Calculate average score
            $averageScore = $certificate->project->evaluations->avg('total_score');
            $evaluationCount = $certificate->project->evaluations->count();

            // Get interpretation
            $interpretation = ScoreInterpretation::where('score_min', '<=', $averageScore)
                ->where('score_max', '>=', $averageScore)
                ->first(['interpretation', 'description']);

            // Get all score interpretations for reference
            $interpretations = ScoreInterpretation::orderBy('score_min')->get()
                ->map(function ($interp) {
                    return [
                        'min' => (float)$interp->score_min,
                        'max' => (float)$interp->score_max,
                        'interpretation' => $interp->interpretation,
                        'description' => $interp->description,
                    ];
                })->toArray();

            // Build detailed evaluations data
            $evaluations = $certificate->project->evaluations->map(function ($evaluation) {
                // Get scores by category
                $scoresByCategory = $evaluation->scores()
                    ->with('questionnaireItem.category')
                    ->get()
                    ->groupBy('questionnaireItem.category_id')
                    ->map(function ($categoryScores) {
                        $categoryId = $categoryScores->first()->questionnaireItem->category_id;
                        $categoryName = $categoryScores->first()->questionnaireItem->category?->category_name;
                        $categoryTotal = $categoryScores->sum('score');

                        return [
                            'category_id' => $categoryId,
                            'category_name' => $categoryName,
                            'subtotal' => (float)$categoryTotal,
                            'items' => $categoryScores->map(function ($score) {
                                return [
                                    'question' => $score->questionnaireItem->question,
                                    'score' => (float)$score->score,
                                    'remarks' => $score->remarks,
                                ];
                            })->toArray(),
                        ];
                    })->values()->toArray();

                return [
                    'id' => $evaluation->id,
                    'evaluator_name' => $evaluation->evaluator->user->name,
                    'evaluator_email' => $evaluation->evaluator->user->email,
                    'total_score' => $evaluation->total_score ? (float)$evaluation->total_score : null,
                    'interpretation' => $evaluation->interpretation?->interpretation,
                    'final_remarks' => $evaluation->final_remarks,
                    'completion_date' => $evaluation->completion_date?->format('F d, Y'),
                    'scores_by_category' => $scoresByCategory,
                ];
            })->toArray();

            // Get evaluator names for signatures
            $evaluatorNames = $certificate->project->evaluations->pluck('evaluator.user.name')->unique()->values()->toArray();

            // Get maximum score from questionnaire (sum of all active category max scores)
            $maxScore = \App\Models\QuestionnaireCategory::where('is_active', true)->sum('max_score');

            // Prepare data for PDF
            $data = [
                'certificate_number' => $certificate->certificate_number,
                'issue_date' => $certificate->issued_date->format('F d, Y'),
                'project_code' => $certificate->project->project_code,
                'project_title' => $certificate->project->project_title,
                'project_description' => $certificate->project->project_description,
                'project_status' => $certificate->project->projectStatus?->name ?? 'Unknown',
                'submission_date' => $certificate->project->created_at?->format('F d, Y'),
                'organization' => $certificate->project->proponent?->organization ?? 'N/A',
                'proponent_name' => $certificate->project->proponent?->user?->name ?? 'N/A',
                'domain' => $certificate->project->domainExpertise?->domain_name ?? 'N/A',
                'phase' => $certificate->project->implementationPhase?->name ?? 'N/A',
                'average_score' => number_format($averageScore, 2),
                'max_score' => (int)$maxScore,
                'interpretation' => $interpretation?->interpretation ?? 'Pending',
                'evaluation_count' => $evaluationCount,
                'evaluations' => $evaluations,
                'interpretations' => $interpretations,
                'evaluator_names' => $evaluatorNames,
                'issued_by' => $certificate->issuedBy?->name ?? 'GAD System Administrator',
                'remarks' => $certificate->remarks,
            ];

            // Generate PDF using view
            $pdf = Pdf::loadView('certificates.gad-certificate', $data);
            $pdf->setPaper('A4', 'portrait');

            return $pdf->download('Certificate-' . $certificate->certificate_number . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Error downloading certificate', [
                'certificate_id' => $certificateId,
                'message' => $e->getMessage()
            ]);

            abort(500, 'Failed to download certificate');
        }
    }

    /**
     * Download document from certification context
     */
    public function downloadDocument($documentId)
    {
        try {
            $document = \App\Models\ProjectDocument::findOrFail($documentId);
            
            // Verify project has certificate
            $certificate = Certificate::where('project_id', $document->project_id)->firstOrFail();

            if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
                return response()->json(['message' => 'Document file not found'], 404);
            }

            return \Illuminate\Support\Facades\Storage::disk('public')->download($document->file_path, $document->file_name);
        } catch (\Exception $e) {
            \Log::error('Error downloading document', [
                'document_id' => $documentId,
                'message' => $e->getMessage()
            ]);

            abort(500, 'Failed to download document');
        }
    }
}
