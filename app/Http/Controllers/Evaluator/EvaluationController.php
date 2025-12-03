<?php

namespace App\Http\Controllers\Evaluator;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Evaluation;
use App\Models\QuestionnaireCategory;
use App\Models\ScoreInterpretation;
use App\Models\ProjectDocument;
use App\Models\Certificate;
use App\Services\QuestionnaireVersionService;
use App\Services\EvaluationQuestionnaireTransformer;
use App\Services\EvaluationVersionManagementService;
use App\Services\EvaluationSubtotalService;
use App\Services\NotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EvaluationController extends Controller
{
    /**
     * Display list of projects assigned to the evaluator
     */
    public function index(Request $request)
    {
        try {
            $evaluator = auth()->user()->evaluator;
            
            if (!$evaluator) {
                return Inertia::render('evaluator/evaluations/index', [
                    'projects' => [],
                    'error' => 'Evaluator profile not found'
                ]);
            }

            // Get all projects assigned to this evaluator
            $query = Project::where('evaluator_id', $evaluator->id)
                ->with([
                    'proponent',
                    'domainExpertise',
                    'implementationPhase',
                    'projectStatus',
                    // Eager-load this evaluator's evaluation (if any)
                    'evaluations' => function ($q) use ($evaluator) {
                        $q->where('evaluator_id', $evaluator->id);
                    }
                ])
                ->orderBy('created_at', 'desc');

            // Filter by status if provided
            $status = $request->query('status');
            $highlightProjectId = $request->query('highlight');
            if ($highlightProjectId) {
                $highlightProjectId = (int) $highlightProjectId;
            }
            
            if ($status && $status !== 'all') {
                // Map status names (from URLs/frontend) to project_status_id (new consecutive IDs: 1-7)
                $statusMap = [
                    'for_evaluation' => 1,
                    'revision' => 2,
                    'approved' => 3,
                    'declined' => 4,
                    'for_certification' => 5,
                    'review' => 6,
                    'certified' => 7,
                ];
                if (isset($statusMap[$status])) {
                    $query->where('project_status_id', $statusMap[$status]);
                }
            }

            // Search by project code or title
            $search = $request->query('search');
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('project_code', 'like', "%{$search}%")
                      ->orWhere('project_title', 'like', "%{$search}%");
                });
            }

            $projects = $query->get()->map(function ($project) use ($evaluator) {
                // If this evaluator previously created an evaluation for the project,
                // it will be present in the eager-loaded evaluations relationship.
                $evaluation = $project->evaluations->first();

                // Determine if evaluator has any saved progress
                $hasProgress = false;
                if ($evaluation) {
                    // Check for saved scores, total_score, or final_remarks
                    $hasScores = $evaluation->scores()->exists();
                    $hasTotal = $evaluation->total_score !== null;
                    $hasRemarks = !empty($evaluation->final_remarks);
                    $hasProgress = $hasScores || $hasTotal || $hasRemarks;
                }

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
                    'submission_date' => $project->created_at?->format('Y-m-d'),
                    'status' => $statusName,
                    'status_id' => $project->project_status_id,
                    'revision_count' => $project->revision_count ?? 0,
                    'evaluation' => $evaluation ? [
                        'id' => $evaluation->id,
                        'status_id' => $evaluation->status_id,
                        'has_progress' => $hasProgress,
                    ] : null,
                ];
            })->toArray();

            return Inertia::render('evaluator/evaluations/index', [
                'projects' => $projects,
                'currentStatus' => $status ?? 'all',
                'searchQuery' => $search ?? '',
                'highlightProjectId' => $highlightProjectId,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching evaluator projects', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('evaluator/evaluations/index', [
                'projects' => [],
                'error' => 'Failed to load projects'
            ]);
        }
    }

    /**
     * Download certificate PDF for a project assigned to this evaluator
     */
    public function downloadCertificate($certificateId)
    {
        try {
            $user = auth()->user();
            $evaluator = $user?->evaluator;

            if (!$user || !$evaluator) {
                abort(403, 'Unauthorized');
            }

            $certificate = Certificate::with([
                'project.proponent.user',
                'project.domainExpertise',
                'project.implementationPhase',
                'project.evaluations' => function ($query) {
                    $query->where('status_id', 2);
                },
                'issuedBy'
            ])->findOrFail($certificateId);

            // Verify evaluator is assigned to this project
            if ($certificate->project->evaluator_id !== $evaluator->id) {
                abort(403, 'Unauthorized');
            }

            // Verify project has completed evaluations
            if ($certificate->project->evaluations->isEmpty()) {
                abort(403, 'No completed evaluations for this project');
            }

            // Calculate average score
            $averageScore = $certificate->project->evaluations->avg('total_score');

            // Get interpretation
            $interpretation = ScoreInterpretation::where('score_min', '<=', $averageScore)
                ->where('score_max', '>=', $averageScore)
                ->first(['interpretation', 'description']);

            // Prepare data for PDF
            $data = [
                'certificate_number' => $certificate->certificate_number,
                'issue_date' => $certificate->issued_date?->format('F d, Y'),
                'project_code' => $certificate->project->project_code,
                'project_title' => $certificate->project->project_title,
                'organization' => $certificate->project->proponent?->organization ?? 'N/A',
                'proponent_name' => $certificate->project->proponent?->user?->name ?? 'N/A',
                'domain' => $certificate->project->domainExpertise?->domain_name ?? 'N/A',
                'phase' => $certificate->project->implementationPhase?->name ?? 'N/A',
                'average_score' => number_format($averageScore, 2),
                'interpretation' => $interpretation?->interpretation ?? 'Pending',
                'issued_by' => $certificate->issuedBy?->name ?? 'GAD System Administrator',
                'remarks' => $certificate->remarks,
            ];

            // Render view to HTML
            $html = View::make('certificates.gad-certificate', $data)->render();

            // Generate PDF
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('a4', 'portrait');
            $pdf->setOptions(['isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true]);

            $tempPath = storage_path('app/temp/' . uniqid() . '.pdf');
            if (!file_exists(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }

            $pdf->save($tempPath);

            $filename = sprintf('Certificate-%s-%s.pdf',
                $certificate->certificate_number,
                date('Y-m-d-His')
            );

            $response = response()->download($tempPath, $filename, [
                'Content-Type' => 'application/pdf',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ])->deleteFileAfterSend(true);

            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Certificate not found');
        } catch (\Exception $e) {
            \Log::error('Error downloading certificate (evaluator)', [
                'certificate_id' => $certificateId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to download certificate');
        }
    }

    /**
     * Show evaluation form for a specific project
     * 
     * IMPORTANT: This method loads questionnaire data from the evaluation's
     * assigned questionnaire version (snapshot), not from the live tables.
     * This ensures version integrity and consistency with Admin 1's config.
     */
    public function show($projectId)
    {
        try {
            $evaluator = auth()->user()->evaluator;
            
            if (!$evaluator) {
                abort(403, 'Evaluator profile not found');
            }

            $project = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'documents.documentType',
                'certificate',
                'evaluations' // used to verify completed evaluations when generating certificate
            ])->findOrFail($projectId);

            // Verify this project is assigned to this evaluator
            if ($project->evaluator_id !== $evaluator->id) {
                abort(403, 'Unauthorized to evaluate this project');
            }

            // Determine correct questionnaire version BEFORE creating the evaluation
            // This prevents inserting a NULL questionnaire_version_id into a non-nullable FK column.
            $existingEvaluation = Evaluation::where(['project_id' => $projectId, 'evaluator_id' => $evaluator->id])->first();

            $correctVersion = EvaluationVersionManagementService::determineQuestionnaireVersion(
                $project,
                $existingEvaluation
            );

            // If no active version exists, auto-create a version from the live snapshot so
            // evaluators can continue working (restores previous behaviour where evaluation
            // was created automatically). Log and create with a timestamped version identifier.
            if (!$correctVersion) {
                Log::warning('No active questionnaire version found - auto-creating one', [
                    'project_id' => $projectId,
                ]);

                $autoVersionNumber = 'auto-' . now()->format('YmdHis');
                $description = 'Auto-created questionnaire version to allow evaluation (system fallback)';
                try {
                    $correctVersion = QuestionnaireVersionService::createVersion($autoVersionNumber, $description, 0);
                    Log::info('Auto-created questionnaire version for evaluation', [
                        'project_id' => $projectId,
                        'new_version_id' => $correctVersion->id,
                        'new_version_number' => $correctVersion->version_number,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to auto-create questionnaire version', [
                        'project_id' => $projectId,
                        'message' => $e->getMessage(),
                    ]);

                    abort(500, 'No active questionnaire version found and fallback creation failed. Please contact administrator.');
                }
            }

            // Create evaluation if it doesn't exist, binding the correct version at creation time
            $evaluation = Evaluation::firstOrCreate(
                ['project_id' => $projectId, 'evaluator_id' => $evaluator->id],
                [
                    'status_id' => 1, // For-evaluation status (ID: 1)
                    'questionnaire_version_id' => $correctVersion->id,
                ]
            );

            // Update evaluation version if it needs to be changed (e.g., for reevaluation)
            if (!$evaluation->questionnaire_version_id || 
                ($evaluation->questionnaire_version_id !== $correctVersion->id && 
                 EvaluationVersionManagementService::isProjectForReevaluation($project))) {
                $evaluation->update([
                    'questionnaire_version_id' => $correctVersion->id,
                    'status_id' => 1, // Reset to for-evaluation (ID: 1)
                ]);

                Log::info('Evaluation version updated', [
                    'project_id' => $projectId,
                    'evaluation_id' => $evaluation->id,
                    'new_version_id' => $correctVersion->id,
                    'new_version_number' => $correctVersion->version_number,
                    'reason' => EvaluationVersionManagementService::isProjectForReevaluation($project) ? 'reevaluation' : 'initial_setup',
                ]);
            }

            // If project is marked for reevaluation, ensure the evaluation is not left in a completed/locked state.
            // Some workflows may mark an evaluation completed earlier; when the project is returned for
            // reevaluation we must allow the evaluator to edit again. Force-reset completed evaluations
            // assigned to this evaluator back to pending so the UI doesn't show the completion message.
            // Completed evaluation statuses: 4 = declined, 3 = approved
            if (EvaluationVersionManagementService::isProjectForReevaluation($project) && in_array($evaluation->status_id, [4, 3])) {
                $evaluation->update([
                    'status_id' => 1, // for-evaluation (ID: 1)
                    'submission_date' => null,
                    'completion_date' => null,
                    'final_remarks' => null,
                ]);

                Log::info('Evaluation unlocked for reevaluation (forced reset)', [
                    'project_id' => $projectId,
                    'evaluation_id' => $evaluation->id,
                ]);
            }

            // Load the questionnaire version relationship with the evaluation
            // This is critical for the transformer to access the snapshot
            // USE THE EVALUATION'S BOUND VERSION, NOT THE ACTIVE VERSION
            $evaluation->load('questionnaireVersion', 'scores');
            
            // AUTO-REFRESH: Check if evaluation should be updated to latest version
            // This happens for incomplete evaluations when a new version becomes available
            $autoRefreshResult = EvaluationVersionManagementService::autoRefreshVersion(
                $project,
                $evaluation
            );
            
            // If auto-refresh occurred, reload the updated version
            if ($autoRefreshResult['success'] ?? false) {
                $evaluation->refresh();
                
                Log::info('Auto-refresh applied to evaluation', [
                    'project_id' => $projectId,
                    'evaluation_id' => $evaluation->id,
                    'refresh_result' => $autoRefreshResult,
                ]);
            }
            
            // Get the BOUND version from the evaluation (not the active version)
            $boundVersion = $evaluation->questionnaireVersion;
            
            if (!$boundVersion) {
                abort(500, 'Evaluation bound questionnaire version not found. Please contact administrator.');
            }

            // Log access for audit trail - use BOUND version
            Log::info('Evaluator accessed evaluation form', [
                'evaluator_id' => $evaluator->id,
                'project_id' => $projectId,
                'evaluation_id' => $evaluation->id,
                'questionnaire_version_id' => $evaluation->questionnaire_version_id,
                'version_number' => $boundVersion->version_number,
                'auto_refresh_applied' => $autoRefreshResult['success'] ?? false,
            ]);

            // IMPORTANT: Use the transformation service to load questionnaire from snapshot
            // This ensures the evaluator sees Admin 1's exact configuration from version creation
            $categories = EvaluationQuestionnaireTransformer::getCategories($evaluation);

            // CRITICAL: If snapshot is empty, the version is corrupted or not properly saved
            // DO NOT fall back to live tables - this would break version integrity!
            if (empty($categories)) {
                Log::error('Empty questionnaire snapshot - evaluation may have corrupted version', [
                    'evaluation_id' => $evaluation->id,
                    'questionnaire_version_id' => $evaluation->questionnaire_version_id,
                    'version_data' => $boundVersion->snapshot,
                ]);
                
                abort(500, 'Questionnaire version has no valid snapshot. Please contact administrator.');
            }

            // Get score interpretation
            $interpretations = ScoreInterpretation::orderBy('score_min')->get()
                ->map(function ($interp) {
                    return [
                        'min' => (float)$interp->score_min,
                        'max' => (float)$interp->score_max,
                        'interpretation' => $interp->interpretation,
                        'description' => $interp->description,
                    ];
                })->toArray();

            // Transform project data
            $projectStatusName = $project->projectStatus?->name ?? 'Unknown';
            if ($projectStatusName === 'for_correction') {
                $projectStatusName = 'for_revision';
            }

            $projectData = [
                'id' => $project->id,
                'project_code' => $project->project_code,
                'title' => $project->project_title,
                'description' => $project->project_description,
                'rationale' => $project->rationale,
                'objectives' => $project->objectives,
                'organization' => $project->proponent?->organization ?? 'N/A',
                'proponent_name' => $project->proponent?->user?->name ?? 'N/A',
                'domain' => $project->domainExpertise?->domain_name ?? 'N/A',
                'phase' => $project->implementationPhase?->name ?? 'N/A',
                'submission_date' => $project->created_at?->format('Y-m-d H:i:s'),
                'status' => $projectStatusName,
                'admin2_remarks' => $project->admin2_remarks,
            ];

            // Include certificate metadata if available for the project (evaluator can view/download if assigned)
            if ($project->certificate) {
                $projectData['certificate'] = [
                    'id' => $project->certificate->id,
                    'certificate_number' => $project->certificate->certificate_number,
                    'issued_date' => $project->certificate->issued_date?->format('Y-m-d'),
                    'can_download' => true,
                    'download_route' => route('evaluator.evaluations.certificate.download', ['certificateId' => $project->certificate->id])
                ];
            } else {
                $projectData['certificate'] = null;
            }

            // Transform documents
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

            // Get version integrity info for debugging/audit
            $versionIntegrityInfo = EvaluationQuestionnaireTransformer::getVersionIntegrityInfo($evaluation);

            return Inertia::render('evaluator/evaluations/show', [
                'project' => $projectData,
                'evaluation' => [
                    'id' => $evaluation->id,
                    'total_score' => $evaluation->total_score ? (float)$evaluation->total_score : null,
                    'status_id' => $evaluation->status_id,
                    'final_remarks' => $evaluation->final_remarks,
                    'completion_date' => $evaluation->completion_date?->format('Y-m-d H:i:s'),
                    'is_completed' => in_array($evaluation->status_id, [4, 3]),
                ],
                'questionnaire_version' => [
                    'id' => $evaluation->questionnaire_version_id,
                    'version_number' => $boundVersion->version_number,
                    'created_at' => $boundVersion->created_at?->format('Y-m-d H:i:s'),
                    'description' => $boundVersion->description,
                ],
                'categories' => $categories,
                'documents' => $documents,
                'interpretations' => $interpretations,
                'version_integrity' => $versionIntegrityInfo,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching evaluation form', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to load evaluation form');
        }
    }

    /**
     * Save evaluation scores
     * 
     * Validates that scores match the questionnaire version configuration
     * before saving. Ensures data integrity per Admin 1's design.
     */
    public function saveScores(Request $request, $projectId)
    {
        // First get the evaluation to validate against its version snapshot
        $evaluator = auth()->user()->evaluator;
        if (!$evaluator) {
            return response()->json(['message' => 'Evaluator not found'], 403);
        }

        $evaluation = Evaluation::where([
            'project_id' => $projectId,
            'evaluator_id' => $evaluator->id,
        ])->firstOrFail();

        // Get valid item IDs from the questionnaire version snapshot
        $version = $evaluation->questionnaireVersion;
        $validItemIds = [];
        if ($version && $version->snapshot) {
            $snapshot = $version->snapshot;
            $validItemIds = collect($snapshot['questions'] ?? [])->pluck('id')->toArray();
        }

        // Validate with custom rule that checks snapshot
        $request->validate([
            'scores' => 'required|array',
            'scores.*.item_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($validItemIds) {
                    if (!in_array($value, $validItemIds)) {
                        $fail("The selected $attribute is invalid.");
                    }
                }
            ],
            'scores.*.score' => 'nullable|numeric|min:0',
            'scores.*.remarks' => 'nullable|string',
            'final_remarks' => 'nullable|string',
        ]);

        try {
            // Check if evaluation is already completed (approved or declined)
            // 3 = approved, 4 = declined
            if (in_array($evaluation->status_id, [3, 4])) {
                return response()->json(
                    ['message' => 'This evaluation has been completed and can no longer be modified.'],
                    403
                );
            }

            // Log save attempt with version info
            Log::info('Evaluator saving evaluation scores', [
                'evaluator_id' => $evaluator->id,
                'evaluation_id' => $evaluation->id,
                'project_id' => $projectId,
                'questionnaire_version_id' => $evaluation->questionnaire_version_id,
                'score_count' => count($request->input('scores', [])),
            ]);

            DB::transaction(function () use ($evaluation, $request) {
                // Save individual scores with version validation
                foreach ($request->input('scores', []) as $scoreData) {
                    if ($scoreData['score'] !== null) {
                        // Validate that the score is allowed by the questionnaire version
                        $isValidScore = EvaluationQuestionnaireTransformer::isValidScore(
                            $evaluation,
                            $scoreData['item_id'],
                            (float)$scoreData['score']
                        );

                        if (!$isValidScore) {
                            throw new \Exception(
                                "Invalid score {$scoreData['score']} for item {$scoreData['item_id']} " .
                                "in questionnaire version {$evaluation->questionnaire_version_id}"
                            );
                        }

                        $evaluation->scores()->updateOrCreate(
                            ['questionnaire_item_id' => $scoreData['item_id']],
                            [
                                'score' => $scoreData['score'],
                                'remarks' => $scoreData['remarks'] ?? null,
                            ]
                        );
                    }
                }

                // Calculate total score
                $totalScore = $evaluation->scores()->sum('score');
                
                // Get max score from bound questionnaire version snapshot (version-accurate)
                $maxScore = EvaluationQuestionnaireTransformer::getMaxScoreFromSnapshot($evaluation);

                // Find matching interpretation
                $interpretation = ScoreInterpretation::where('score_min', '<=', $totalScore)
                    ->where('score_max', '>=', $totalScore)
                    ->first();

                // Update evaluation with snapshot-derived max score
                $evaluation->update([
                    'total_score' => $totalScore,
                    'max_score' => $maxScore,
                    'interpretation_id' => $interpretation?->id,
                    'final_remarks' => $request->input('final_remarks'),
                ]);

                // Calculate and store category-level subtotals
                EvaluationSubtotalService::calculateAndStore($evaluation);
            });

            Log::info('Evaluator scores saved successfully', [
                'evaluation_id' => $evaluation->id,
                'total_score' => $evaluation->total_score,
                'questionnaire_version_id' => $evaluation->questionnaire_version_id,
            ]);

            return response()->json([
                'message' => 'Evaluation saved successfully',
                'evaluation' => [
                    'id' => $evaluation->id,
                    'total_score' => (float)$evaluation->total_score,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving evaluation scores', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error saving evaluation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit evaluation
     * 
     * Locks evaluation to the questionnaire version and prevents further modifications.
     * Logs version integrity information for audit trail.
     */
    public function submit(Request $request, $projectId)
    {
        try {
            $evaluator = auth()->user()->evaluator;
            
            if (!$evaluator) {
                return response()->json(['message' => 'Evaluator not found'], 403);
            }

            $evaluation = Evaluation::where([
                'project_id' => $projectId,
                'evaluator_id' => $evaluator->id,
            ])->firstOrFail();

            // Check if evaluation is already completed (approved or declined)
            // 3 = approved, 4 = declined
            if (in_array($evaluation->status_id, [3, 4])) {
                return response()->json(
                    ['message' => 'This evaluation has already been submitted and cannot be modified.'],
                    403
                );
            }

            // Validate final action from evaluator (approve, revision, decline)
            $request->validate([
                'final_action' => 'required|string|in:approve,revision,decline'
            ]);

            $finalAction = $request->input('final_action');

            // Get version integrity info before submission
            $versionInfo = EvaluationQuestionnaireTransformer::getVersionIntegrityInfo($evaluation);

            // Log submission with full version context
            Log::info('Evaluator submitting evaluation', [
                'evaluator_id' => $evaluator->id,
                'evaluation_id' => $evaluation->id,
                'project_id' => $projectId,
                'questionnaire_version_id' => $evaluation->questionnaire_version_id,
                'version_number' => $versionInfo['version_number'],
                'categories_count' => $versionInfo['categories_count'],
                'questions_count' => $versionInfo['questions_count'],
                'total_score' => $evaluation->total_score,
                'version_integrity' => $versionInfo['snapshot_integrity'],
            ]);

            // Map final action to evaluation status IDs (new consecutive IDs: 1-7)
            // approve => 3, revision => 2, decline => 4
            $evaluationStatusMap = [
                'approve' => 3,
                'revision' => 2,
                'decline' => 4,
            ];

            $evaluationStatusToSet = $evaluationStatusMap[$finalAction] ?? null;

            if (empty($evaluationStatusToSet)) {
                Log::warning('Unknown final action provided when submitting evaluation', [
                    'final_action' => $finalAction,
                    'evaluation_id' => $evaluation->id,
                ]);
            } else {
                // BEFORE LOCKING: Recompute and confirm interpretation is correct
                // This ensures data integrity even if saveScores was skipped
                if ($evaluation->total_score !== null) {
                    $interpretation = ScoreInterpretation::where('score_min', '<=', $evaluation->total_score)
                        ->where('score_max', '>=', $evaluation->total_score)
                        ->first();

                    // If max_score wasn't set during saveScores (edge case), set it now from snapshot
                    $maxScore = $evaluation->max_score;
                    if (!$maxScore) {
                        $maxScore = EvaluationQuestionnaireTransformer::getMaxScoreFromSnapshot($evaluation);
                    }

                    $evaluation->update([
                        'interpretation_id' => $interpretation?->id,
                        'max_score' => $maxScore,
                        'status_id' => $evaluationStatusToSet,
                        'submission_date' => now(),
                        'completion_date' => now(),
                    ]);

                    Log::info('Interpretation recomputed and confirmed at submission', [
                        'evaluation_id' => $evaluation->id,
                        'total_score' => $evaluation->total_score,
                        'max_score' => $maxScore,
                        'interpretation_id' => $interpretation?->id,
                        'interpretation' => $interpretation?->interpretation,
                    ]);
                } else {
                    // No total_score set; just lock the evaluation without interpretation
                    $evaluation->update([
                        'status_id' => $evaluationStatusToSet,
                        'submission_date' => now(),
                        'completion_date' => now(),
                    ]);
                }
            }

            // Map final action to project status IDs (new consecutive IDs: 1-7)
            // approve => 3, revision => 2, decline => 4
            $projectStatusMap = [
                'approve' => 3,
                'revision' => 2,
                'decline' => 4,
            ];

            $newProjectStatusId = $projectStatusMap[$finalAction] ?? null;

            if ($newProjectStatusId) {
                // Ensure we have the Project instance available
                $project = Project::find($projectId);

                if ($project) {
                    // Ensure the evaluator is assigned to this project before changing status
                    if ($project->evaluator_id !== $evaluator->id) {
                        Log::warning('Evaluator attempted to update project status but is not assigned', [
                            'project_id' => $project->id,
                            'assigned_evaluator_id' => $project->evaluator_id,
                            'current_evaluator_id' => $evaluator->id,
                        ]);

                        return response()->json([
                            'message' => 'Unauthorized to update project status for this project.'
                        ], 403);
                    }

                    // Log the status transition
                    Log::info('Updating project status after evaluator submission', [
                        'project_id' => $project->id,
                        'old_status_id' => $project->project_status_id,
                        'new_status_id' => $newProjectStatusId,
                        'final_action' => $finalAction,
                    ]);

                    $project->update([
                        'project_status_id' => $newProjectStatusId,
                    ]);

                    // Send notifications after project status is updated
                    $this->sendNotificationsAfterEvaluation($project, $finalAction, $evaluator);
                } else {
                    Log::warning('Project not found when updating status after evaluation submit', ['project_id' => $projectId]);
                }
            }

            Log::info('Evaluation successfully submitted and locked to questionnaire version', [
                'evaluation_id' => $evaluation->id,
                'questionnaire_version_id' => $evaluation->questionnaire_version_id,
                'completion_date' => $evaluation->completion_date,
            ]);

            return response()->json([
                'message' => 'Evaluation submitted successfully',
                'evaluation' => [
                    'id' => $evaluation->id,
                    'status_id' => $evaluation->status_id,
                    'completion_date' => $evaluation->completion_date,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error submitting evaluation', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error submitting evaluation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a project document
     */
    public function downloadDocument($documentId)
    {
        try {
            $evaluator = auth()->user()->evaluator;
            
            if (!$evaluator) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $document = ProjectDocument::findOrFail($documentId);
            
            // Verify that the evaluator has access to this document
            $project = Project::where('id', $document->project_id)
                ->where('evaluator_id', $evaluator->id)
                ->firstOrFail();

            if (!Storage::disk('public')->exists($document->file_path)) {
                return response()->json(['message' => 'Document file not found'], 404);
            }

            return Storage::disk('public')->download($document->file_path, $document->file_name);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Document or project not found'], 404);
        } catch (\Exception $e) {
            \Log::error('Error downloading document', [
                'document_id' => $documentId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error downloading document'
            ], 500);
        }
    }

    /**
     * Send notifications after evaluation completion
     */
    private function sendNotificationsAfterEvaluation($project, $finalAction, $evaluator)
    {
        try {
            Log::info('Sending notifications after evaluation', [
                'project_id' => $project->id,
                'final_action' => $finalAction,
                'evaluator_id' => $evaluator->id,
            ]);

            // Send notifications based on final action
            switch ($finalAction) {
                case 'approve':
                    // Notify proponent
                    NotificationService::notifyProponentEvaluationCompleted($project, 'approved');
                    
                    // Notify admin1
                    NotificationService::notifyAdmin1EvaluationCompleted($project, 'approved');
                    
                    // Notify admin2
                    NotificationService::notifyAdmin2ProjectApprovedByEvaluator($project, $evaluator);
                    
                    Log::info('Approval notifications sent', ['project_id' => $project->id]);
                    break;
                    
                case 'revision':
                    // Notify proponent
                    NotificationService::notifyProponentEvaluationCompleted($project, 'revision');
                    
                    // Notify admin1
                    NotificationService::notifyAdmin1EvaluationCompleted($project, 'revision');
                    
                    Log::info('Revision notifications sent', ['project_id' => $project->id]);
                    break;
                    
                case 'decline':
                    // Notify proponent
                    NotificationService::notifyProponentEvaluationCompleted($project, 'declined');
                    
                    // Notify admin1
                    NotificationService::notifyAdmin1EvaluationCompleted($project, 'declined');
                    
                    Log::info('Decline notifications sent', ['project_id' => $project->id]);
                    break;
            }
        } catch (\Exception $e) {
            Log::error('Error sending notifications after evaluation', [
                'project_id' => $project->id,
                'final_action' => $finalAction,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
