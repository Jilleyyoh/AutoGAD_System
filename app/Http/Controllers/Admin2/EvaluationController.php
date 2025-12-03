<?php

namespace App\Http\Controllers\Admin2;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Evaluation;
use App\Models\EvaluationStatus;
use App\Models\ProjectStatus;
use App\Models\Notification;
use App\Models\ScoreInterpretation;
use App\Services\EvaluationVersionManagementService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluationController extends Controller
{
    /**
     * Display list of completed evaluations for Admin2
     */
    public function index(Request $request)
    {
        try {
            // Get all projects that have reached Admin2's access point
            // Admin2 sees all projects that have at least one evaluation completed (gatekeeper access)
            // We use consolidated_score as the marker - it's only set when Admin2 has accessed/approved evaluations
            // Alternative: use project_status_id to find projects in statuses beyond "approved"
            
            // Get projects that Admin2 has access to:
            // - Have evaluations that were completed at some point (consolidated_score is set), OR
            // - Are in statuses that come after initial approval (for_certification, review, certified, etc.)
            
            $projectIds = Project::where(function ($query) {
                // Has been consolidated by Admin2 (consolidated_score set)
                $query->whereNotNull('consolidated_score')
                    // OR is in a post-approval status
                    ->orWhereIn('project_status_id', function ($subquery) {
                        $subquery->select('id')
                            ->from('project_statuses')
                            ->whereIn('name', ['approved', 'for_certification', 'review', 'certified']);
                    });
            })->pluck('id');
            
            // Get projects and fetch ALL evaluations (unfiltered) for current state display
            $projectsQuery = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'evaluations' => function ($query) {
                    // Load ALL evaluations to show current state, ordered by completion date
                    $query->with('evaluator.user', 'questionnaireVersion')
                        ->orderBy('completion_date', 'desc');
                }
            ])->whereIn('id', $projectIds)
              ->orderBy('updated_at', 'desc');

            $projects = $projectsQuery->paginate(15);

            $evaluationsData = $projects->getCollection()->map(function ($project) {
                // Take the first (most recent) evaluation for display (could be any status)
                $firstEval = $project->evaluations->first();
                
                return [
                    'id' => $firstEval?->id,
                    'project_id' => $project->id,
                    'project_code' => $project->project_code ?? 'N/A',
                    'title' => $project->project_title ?? 'N/A',
                    'organization' => $project->proponent?->organization ?? 'N/A',
                    'domain' => $project->domainExpertise?->domain_name ?? 'N/A',
                    'phase' => $project->implementationPhase?->name ?? 'N/A',
                    'evaluator_name' => $firstEval?->evaluator?->user?->name ?? 'N/A',
                    'evaluator_email' => $firstEval?->evaluator?->user?->email ?? null,
                    'total_score' => $firstEval?->total_score ? (float)$firstEval->total_score : null,
                    'completion_date' => $firstEval?->completion_date?->format('Y-m-d H:i:s'),
                    'questionnaire_version' => $firstEval?->questionnaireVersion?->version_number ?? null,
                    'status' => $project->projectStatus?->name ?? 'Unknown',
                    'admin2_remarks' => $project->admin2_remarks,
                ];
            })->toArray();

            return Inertia::render('admin2/evaluations/index', [
                'evaluations' => $evaluationsData,
                'pagination' => [
                    'total' => $projects->total(),
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching evaluations for admin2', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to load evaluations');
        }
    }

    /**
     * Review evaluation results for a specific project
     */
    public function review($projectId)
    {
        try {
            $project = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'evaluations' => function ($query) {
                      $query->where('status_id', 3)
                          ->with('evaluator.user', 'interpretation', 'questionnaireVersion');
                    }
            ])->findOrFail($projectId);

            // Get all evaluations for this project
            $evaluations = $project->evaluations->map(function ($evaluation) {
                $scores = $evaluation->scores()
                    ->with('questionnaireItem.category')
                    ->get();

                // Group scores by category
                $scoresByCategory = $scores->groupBy(function ($score) {
                    return $score->questionnaireItem->category?->id;
                })->map(function ($categoryScores) {
                    $categoryTotal = $categoryScores->sum('score');
                    $categoryId = $categoryScores->first()->questionnaireItem->category?->id;
                    $categoryName = $categoryScores->first()->questionnaireItem->category?->category_name;

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

            // Calculate consolidated average
            $averageScore = count($evaluations) > 0
                ? array_sum(array_column($evaluations, 'total_score')) / count($evaluations)
                : null;

            // Fetch score interpretations from Admin 1 questionnaire settings
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

            $projectData = [
                'id' => $project->id,
                'project_code' => $project->project_code,
                'title' => $project->project_title,
                'description' => $project->project_description,
                'organization' => $project->proponent?->organization ?? 'N/A',
                'proponent_name' => $project->proponent?->user?->name ?? 'N/A',
                'domain' => $project->domainExpertise?->domain_name ?? 'N/A',
                'phase' => $project->implementationPhase?->name ?? 'N/A',
                'status' => $projectStatusName,
            ];

            return Inertia::render('admin2/evaluations/review', [
                'project' => $projectData,
                'evaluations' => $evaluations,
                'average_score' => $averageScore ? (float)$averageScore : null,
                'evaluation_count' => count($evaluations),
                'interpretations' => $interpretations,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error reviewing evaluation', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to load evaluation review');
        }
    }

    /**
     * Consolidate (approve) evaluation results
     */
    public function consolidate(Request $request, $projectId)
    {
        $request->validate([
            'action' => 'required|in:approve,return_for_review',
            'admin_remarks' => 'nullable|string',
        ]);

        try {
            $project = Project::with('evaluations', 'proponent.user')->findOrFail($projectId);

            // Check if all evaluators have submitted
                $completedEvaluations = $project->evaluations->where('status_id', 3);
            $totalEvaluators = $project->evaluations->count();

            if ($request->input('action') === 'approve') {
                // Verify all evaluations are completed
                if ($completedEvaluations->count() < $totalEvaluators) {
                    return response()->json([
                        'message' => 'Cannot approve: Not all evaluators have completed their evaluations.'
                    ], 400);
                }

                // Calculate final consolidated score
                $finalScore = $completedEvaluations->avg('total_score');

                // Update all evaluations with consolidation info
                DB::transaction(function () use ($project, $finalScore, $request) {
                    // Update project status to "For Certification"
                    // Assuming status_id 7 or similar exists, we'll need to verify
                    $certificationStatus = ProjectStatus::firstOrCreate(
                        ['name' => 'for_certification'],
                        ['name' => 'for_certification']
                    );

                    $project->update([
                        'project_status_id' => $certificationStatus->id,
                        'consolidated_score' => $finalScore,
                        'admin2_remarks' => $request->input('admin_remarks'),
                    ]);

                    // Mark evaluations as consolidated
                    $project->evaluations()
                        ->where('status_id', 3)
                        ->update(['consolidated_at' => now()]);
                });

                // Send notifications using centralized service
                NotificationService::notifyProponentApprovedForCertification($project);
                NotificationService::notifyEvaluatorApprovedForCertification($project);
                NotificationService::notifyAdmin1ApprovedForCertification($project);

                return response()->json([
                    'message' => 'Evaluation consolidated and approved for certification',
                    'project' => [
                        'id' => $project->id,
                        'status' => 'For Certification'
                    ]
                ]);
            } else {
                // Return for review - status will be "review" for evaluator re-evaluation
                DB::transaction(function () use ($project, $request) {
                    $reviewStatus = ProjectStatus::where('name', 'review')->firstOrFail();
                    $reviewEvalStatus = EvaluationStatus::where('name', 'review')->firstOrFail();

                    $project->update([
                        'project_status_id' => $reviewStatus->id,
                        'admin2_remarks' => $request->input('admin_remarks'),
                    ]);

                    // Reset evaluation status to "review" - allows evaluator to re-evaluate
                    $project->evaluations()->update(['status_id' => $reviewEvalStatus->id]);
                    
                    // Update evaluation to use latest version for reevaluation
                    // This unlocks the evaluation from its previous version binding
                    EvaluationVersionManagementService::unlockForReevaluation($project);
                });

                // Send notifications using centralized service
                NotificationService::notifyProponentReturnedForReview($project);
                NotificationService::notifyEvaluatorReturnedForReview($project);
                NotificationService::notifyAdmin1ReturnedForReview($project);

                return response()->json([
                    'message' => 'Evaluation returned for evaluator review',
                    'project' => [
                        'id' => $project->id,
                        'status' => 'Review'
                    ]
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error consolidating evaluation', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error consolidating evaluation: ' . $e->getMessage()
            ], 500);
        }
    }



    /**
     * Display questionnaire version history for Admin2
     */
    public function versionHistory()
    {
        try {
            $versions = \App\Models\QuestionnaireVersion::with('evaluations')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($version) {
                    // snapshot is already an array thanks to the model's 'array' cast
                    $snapshot = $version->snapshot ?? [];
                    return [
                        'id' => $version->id,
                        'version_number' => $version->version_number,
                        'status' => $version->status,
                        'is_active' => $version->is_active,
                        'created_at' => $version->created_at->toIso8601String(),
                        'description' => $version->description,
                        'evaluation_count' => $version->evaluations->count(),
                        'snapshot' => [
                            'categories' => $snapshot['categories'] ?? [],
                            'questions' => $snapshot['questions'] ?? [],
                            'question_count' => $snapshot['question_count'] ?? count($snapshot['questions'] ?? []),
                            'category_count' => $snapshot['category_count'] ?? count($snapshot['categories'] ?? []),
                            'total_points' => $snapshot['total_points'] ?? $snapshot['total_max_score'] ?? 0,
                        ],
                    ];
                })
                ->toArray();

            return Inertia::render('admin2/versions/index', [
                'versions' => $versions,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching questionnaire versions', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            abort(500, 'Failed to load questionnaire versions');
        }
    }
}

