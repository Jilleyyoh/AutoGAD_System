<?php

namespace App\Http\Controllers\Proponent;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Project;
use App\Models\ScoreInterpretation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display list of certificates for the proponent
     */
    public function index(Request $request)
    {
        try {
            $highlightCertificateId = $request->query('highlight');
            if ($highlightCertificateId) {
                $highlightCertificateId = (int) $highlightCertificateId;
            }
            
            $user = auth()->user();
            
            if (!$user) {
                return Inertia::render('proponent/certificates/index', [
                    'certificates' => [],
                    'error' => 'User not authenticated',
                    'highlightCertificateId' => $highlightCertificateId,
                ]);
            }

            // Get the proponent profile for this user
            $proponent = $user->proponent;
            if (!$proponent) {
                return Inertia::render('proponent/certificates/index', [
                    'certificates' => [],
                    'error' => 'Proponent profile not found',
                    'highlightCertificateId' => $highlightCertificateId,
                ]);
            }

            // Get all certificates for projects owned by this proponent
            $certificates = Certificate::whereHas('project', function ($query) use ($proponent) {
                $query->where('proponent_id', $proponent->id);
            })
            ->with([
                'project',  // Need full project to get status correctly
                'evaluation:id,questionnaire_version_id,total_score',
                'evaluation.questionnaireVersion:id,version_number,created_at',
                'project.projectStatus',  // Need full status to get name correctly
                'status',  // Need full status for comparison
            ])
            ->orderBy('issued_date', 'desc')
            ->get()
            ->map(function ($cert) {
                // Certificates can always be downloaded (generated on-the-fly)
                $version = $cert->evaluation?->questionnaireVersion;
                $versionString = $version ? $version->version_number : 'N/A';

                return [
                    'id' => $cert->id,
                    'project_title' => $cert->project->project_title,
                    'project_code' => $cert->project->project_code,
                    'certification_date' => $cert->created_at?->format('Y-m-d'),
                    'issue_date' => $cert->issued_date?->format('Y-m-d'),
                    // Use project status if it's certified/completed, otherwise use certificate status
                    'status' => $this->getUnifiedStatus($cert),
                    'questionnaire_version' => $versionString,
                    'can_download' => true,
                ];
            })
            ->toArray();

            return Inertia::render('proponent/certificates/index', [
                'certificates' => $certificates,
                'highlightCertificateId' => $highlightCertificateId,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching proponent certificates', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('proponent/certificates/index', [
                'certificates' => [],
                'error' => 'Failed to load certificates',
            ]);
        }
    }

    /**
     * Get certificate stats for dashboard
     */
    /**
     * Helper method to get unified status from project and certificate
     */
    private function getUnifiedStatus($certificate)
    {
        // Get project status name and ID
        $project = $certificate->project;
        $projectStatusId = $project?->project_status_id;
        $projectStatusName = $project?->projectStatus?->name;
        if ($projectStatusName === 'for_correction') {
            $projectStatusName = 'revision';
        }

        // If project has status_id 7 (Certified), use that
        if ($projectStatusId == 7 || $projectStatusName === 'Certified') {
            return 'Certified';
        }
        
        if ($projectStatusId == 5 || $projectStatusName === 'for_certification') {
            return 'For Certification';
        }

        // Fallback to certificate status if project status isn't certified/completed
        return $certificate->status?->name ?? 'Unknown';
    }

    public function getStats(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Get the proponent profile for this user
            $proponent = $user->proponent;
            if (!$proponent) {
                return response()->json(['error' => 'Proponent profile not found'], 403);
            }

            $certificates = Certificate::whereHas('project', function ($query) use ($proponent) {
                $query->where('proponent_id', $proponent->id);
            })
            ->with([
                'status:id,name',
                'project.projectStatus:id,name'
            ])
            ->get();

            // Group by unified status
            $stats = $certificates->groupBy(function ($cert) {
                return $this->getUnifiedStatus($cert);
            })->map->count();

            return response()->json([
                'total' => array_sum($stats),
                'certified' => ($stats['Certified'] ?? 0) + ($stats['Completed'] ?? 0),
                'pending' => $stats['Unknown'] ?? 0, // Map unknown to pending for stats
                'approved' => $stats['Approved'] ?? 0,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching certificate stats', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to fetch stats'], 500);
        }
    }

    /**
     * Download certificate PDF
     */
    public function download($certificateId)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                abort(403, 'Unauthorized');
            }

            // Get the proponent profile for this user
            $proponent = $user->proponent;
            if (!$proponent) {
                abort(403, 'Unauthorized');
            }

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

            // Verify the certificate belongs to this proponent
            if ($certificate->project->proponent_id !== $proponent->id) {
                abort(403, 'Unauthorized');
            }

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
            
            // Set filename
            $filename = sprintf('Certificate-%s-%s.pdf', 
                $certificate->certificate_number,
                date('Y-m-d-His')
            );
            
            // Return download response
            return $pdf->download($filename);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Certificate not found');
        } catch (\Exception $e) {
            \Log::error('Error downloading certificate', [
                'certificate_id' => $certificateId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to download certificate');
        }
    }
}
