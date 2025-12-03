<?php

namespace App\Http\Controllers\Admin1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Evaluator;
use App\Models\AssignmentLog;
use App\Models\ProjectDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Services\EvaluationVersionManagementService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Route;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        try {
            \Log::info('AssignmentController@index called');
            
            $highlightProjectId = $request->query('highlight');
            if ($highlightProjectId) {
                $highlightProjectId = (int) $highlightProjectId;
            }
            
            $projects = Project::query()
                ->select([
                    'projects.id',
                    'projects.project_code',
                    'projects.project_title',
                    'projects.project_status_id',
                    'projects.created_at',
                    'projects.domain_expertise_id',
                    'projects.implementation_phase_id',
                    'projects.proponent_id',
                    'projects.evaluator_id'
                ])
                ->with([
                    'projectStatus',
                    'proponent',
                    'domainExpertise',
                    'implementationPhase',
                    'evaluator.user'
                ])
                ->orderBy('projects.created_at', 'desc')
                ->get();

            \Log::info('Fetched projects for assignments', ['count' => $projects->count()]);

            return Inertia::render('admin1/assignments/index', [
                'projects' => $projects->map(function ($project) {
                    $statusName = $project->projectStatus?->name ?? null;
                    if ($statusName === 'for_correction') {
                        $statusName = 'revision';
                    }

                    $data = [
                        'id' => $project->id,
                        'project_code' => $project->project_code,
                        'title' => $project->project_title,
                        'status' => $project->project_status_id,
                        'status_name' => $statusName,
                        'submission_date' => $project->created_at,
                        'domain_id' => $project->domain_expertise_id,
                        'implementation_phase_id' => $project->implementation_phase_id,
                    ];

                    if ($project->proponent) {
                        $data['proponent'] = [
                            'id' => $project->proponent->id,
                            'organization' => [
                                'id' => $project->proponent->id,
                                'name' => $project->proponent->organization ?? 'N/A'
                            ]
                        ];
                    } else {
                        $data['proponent'] = null;
                    }

                    if ($project->domainExpertise) {
                        $data['domainExpertise'] = [
                            'id' => $project->domainExpertise->id,
                            'name' => $project->domainExpertise->domain_name
                        ];
                    } else {
                        $data['domainExpertise'] = null;
                    }

                    if ($project->implementationPhase) {
                        $data['implementationPhase'] = [
                            'id' => $project->implementationPhase->id,
                            'name' => $project->implementationPhase->name
                        ];
                    } else {
                        $data['implementationPhase'] = null;
                    }

                    if ($project->evaluator && $project->evaluator->user) {
                        $data['evaluator'] = [
                            'id' => $project->evaluator->id,
                            'name' => $project->evaluator->user->name,
                            'email' => $project->evaluator->user->email
                        ];
                    } else {
                        $data['evaluator'] = null;
                    }

                    return $data;
                })->toArray(),
                'highlightProjectId' => $highlightProjectId
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in AssignmentController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('admin1/assignments/index', [
                'projects' => [],
                'error' => $e->getMessage(),
                'highlightProjectId' => $highlightProjectId
            ]);
        }
    }

    /**
     * Reassign a project back to the proponent for editing (Admin action).
     * This will clear the evaluator assignment and set the project status to for_revision.
     */
    public function reassignToProponent(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id'
        ]);

        try {
            $project = null;
            \DB::transaction(function () use ($request, &$project) {
                $project = Project::findOrFail($request->project_id);

                // Clear evaluator assignment
                $project->evaluator_id = null;

                // Ensure revision status exists and apply it
                $revisionStatus = \App\Models\ProjectStatus::firstOrCreate(['name' => 'revision']);
                $project->project_status_id = $revisionStatus->id;
                $project->save();

                // Log the assignment change
                AssignmentLog::create([
                    'project_id' => $project->id,
                    'evaluator_id' => null,
                    'assigned_by' => auth()->id(),
                    'status_id' => 2, // custom status for reassigned to proponent (semantic)
                    'assignment_date' => now(),
                ]);
            });

            // return a fresh project payload
            $project->load('projectStatus', 'evaluator.user');

            return response()->json([
                'message' => 'Project reassigned to proponent',
                'project' => [
                    'id' => $project->id,
                    'status' => $project->project_status_id,
                    'status_name' => ($project->projectStatus?->name === 'for_correction') ? 'for_revision' : $project->projectStatus?->name,
                    'evaluator' => null
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error reassigning project to proponent', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Error reassigning project: ' . $e->getMessage()], 500);
        }
    }

    public function getEvaluators(Request $request, $domainId)
    {
        try {
            \Log::debug('getEvaluators called', ['domainId' => $domainId]);
            
            $evaluators = Evaluator::query()
                ->where('domain_expertise_id', $domainId)
                ->with('user')
                ->get()
                ->map(function($evaluator) {
                    return [
                        'id' => $evaluator->id,
                        'name' => $evaluator->user->name ?? 'Unknown',
                        'email' => $evaluator->user->email ?? '',
                    ];
                });

            \Log::debug('Found evaluators', ['count' => $evaluators->count()]);

            return response()->json($evaluators);
        } catch (\Exception $e) {
            \Log::error('Error in getEvaluators', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch evaluators: ' . $e->getMessage()
            ], 500);
        }
    }

    public function assignEvaluator(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'evaluator_id' => 'required|exists:evaluators,id',
        ]);

        try {
            $project = null;
            $originalStatusName = null;
            
            // Get the original status before the transaction to determine notification type
            $originalProject = Project::with('projectStatus')->findOrFail($request->project_id);
            $originalStatusName = $originalProject->projectStatus?->name ?? null;
            if ($originalStatusName === 'for_correction') {
                $originalStatusName = 'revision';
            }
            
            DB::transaction(function () use ($request, &$project) {
                $project = Project::findOrFail($request->project_id);
                
                // Create assignment log with status_id = 1 (assigned)
                AssignmentLog::create([
                    'project_id' => $request->project_id,
                    'evaluator_id' => $request->evaluator_id,
                    'assigned_by' => auth()->id(),
                    'status_id' => 1, // 1 = 'assigned'
                    'assignment_date' => now(),
                ]);

                // Update project evaluator_id
                $project->update(['evaluator_id' => $request->evaluator_id]);
                
                // Update project status to "For Evaluation" (id = 1) when assigning
                // if it's currently in a state that should trigger reevaluation.
                // Use status NAME checks (more robust) instead of hard-coded ids.
                $oldStatusId = $project->project_status_id;
                $oldStatusName = $project->projectStatus?->name ?? null;
                if ($oldStatusName === 'for_correction') {
                    $oldStatusName = 'revision';
                }

                $reevalNames = ['revision', 'revised', 'on_hold', 'pending'];
                if (in_array($oldStatusName, $reevalNames, true)) {
                    $project->update(['project_status_id' => 1]); // 1 = 'for_evaluation'

                    \Log::info('Project status updated', [
                        'project_id' => $request->project_id,
                        'old_status_id' => $oldStatusId,
                        'old_status_name' => $oldStatusName,
                        'new_status_id' => 1
                    ]);

                    // If the project was previously for revision/revised, unlock the evaluation
                    // for the specific assigned evaluator so they can re-evaluate.
                    if (in_array($oldStatusName, ['revision', 'revised'], true)) {
                        try {
                            EvaluationVersionManagementService::unlockForReevaluation($project, $request->evaluator_id);
                        } catch (\Exception $e) {
                            \Log::error('Failed to unlock evaluation for reevaluation during assignEvaluator', [
                                'project_id' => $project->id,
                                'evaluator_id' => $request->evaluator_id,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
                
                \Log::info('Evaluator assigned to project', [
                    'project_id' => $request->project_id,
                    'evaluator_id' => $request->evaluator_id,
                    'assigned_by' => auth()->id(),
                    'final_status_id' => $project->project_status_id
                ]);
            });

            // Refresh project with relationships
            $project->load('evaluator.user');
            
            // Send notification to the evaluator about the new assignment
            if ($project->evaluator) {                
                $isRevision = in_array($originalStatusName, ['revision', 'revised'], true);
                
                try {
                    NotificationService::notifyEvaluatorProjectAssigned($project, $project->evaluator, $isRevision);
                    
                    \Log::info('Notification sent to evaluator', [
                        'project_id' => $project->id,
                        'evaluator_id' => $project->evaluator->id,
                        'is_revision' => $isRevision
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send notification to evaluator', [
                        'project_id' => $project->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            $evaluatorData = null;
            if ($project->evaluator && $project->evaluator->user) {
                $evaluatorData = [
                    'id' => $project->evaluator->id,
                    'name' => $project->evaluator->user->name,
                    'email' => $project->evaluator->user->email
                ];
            }

            return response()->json([
                'message' => 'Evaluator assigned successfully',
                'project' => [
                    'id' => $project->id,
                    'project_code' => $project->project_code,
                    'status' => $project->project_status_id,
                    'evaluator' => $evaluatorData
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error assigning evaluator', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Error assigning evaluator: ' . $e->getMessage()], 500);
        }
    }

    public function unassignEvaluator(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'evaluator_id' => 'required|exists:evaluators,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $project = Project::findOrFail($request->project_id);
                
                // Update project evaluator_id to null
                $project->update(['evaluator_id' => null]);
                
                // Mark assignment logs as removed (status_id = 3)
                AssignmentLog::where([
                    'project_id' => $request->project_id,
                    'evaluator_id' => $request->evaluator_id,
                    'status_id' => 1 // only update those with 'assigned' status
                ])->update(['status_id' => 3]); // 3 = 'removed'
                
                \Log::info('Evaluator unassigned from project', [
                    'project_id' => $request->project_id,
                    'evaluator_id' => $request->evaluator_id
                ]);
            });

            return response()->json(['message' => 'Evaluator unassigned successfully']);
        } catch (\Exception $e) {
            \Log::error('Error unassigning evaluator', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Error unassigning evaluator: ' . $e->getMessage()], 500);
        }
    }

    public function getProjectDetails($projectId)
    {
        try {
            $project = Project::with([
                'proponent',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'evaluator.user',
                'documents.documentType',
                'evaluations' => function ($q) { $q->whereIn('status_id', [2, 3, 4])->latest(); }
            ])->findOrFail($projectId);

            $documents = $project->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'description' => $doc->description,
                    'document_type' => $doc->documentType?->name ?? 'Unknown',
                    'upload_date' => $doc->upload_date?->format('Y-m-d H:i:s'),
                    'file_path' => $doc->file_path,
                    'drive_link' => $doc->drive_link,
                ];
            });

            // Get evaluation data if it exists
            $evaluation = null;
            $interpretations = [];
            $latestEvaluation = $project->evaluations->first();
            
            if ($latestEvaluation) {
                $scoreInterpretation = $latestEvaluation->interpretation;
                $evaluation = [
                    'status_id' => $latestEvaluation->status_id,
                    'final_remarks' => $latestEvaluation->final_remarks,
                    'interpretation' => $scoreInterpretation ? [
                        'interpretation' => $scoreInterpretation->interpretation,
                        'description' => $scoreInterpretation->description,
                    ] : null,
                    'completion_date' => $latestEvaluation->completion_date?->format('Y-m-d H:i:s'),
                    'is_completed' => in_array($latestEvaluation->status_id, [2, 3, 4]),
                ];
                
                // Get all score interpretations for reference
                $interpretations = \App\Models\ScoreInterpretation::all(['min', 'max', 'interpretation', 'description'])->toArray();
            }

            return response()->json([
                'id' => $project->id,
                'project_code' => $project->project_code,
                'project_title' => $project->project_title,
                'project_description' => $project->project_description,
                'rationale' => $project->rationale,
                'objectives' => $project->objectives,
                'proponent' => [
                    'id' => $project->proponent->id,
                    'organization' => $project->proponent->organization ?? 'N/A',
                    'name' => $project->proponent->user?->name ?? 'N/A',
                ],
                'domain_expertise' => [
                    'id' => $project->domainExpertise->id,
                    'name' => $project->domainExpertise->domain_name,
                ],
                'implementation_phase' => [
                    'id' => $project->implementationPhase->id,
                    'name' => $project->implementationPhase->name,
                ],
                'project_status' => [
                    'id' => $project->projectStatus->id,
                    'name' => $project->projectStatus->name === 'for_correction' ? 'revision' : $project->projectStatus->name,
                ],
                'current_evaluator' => $project->evaluator ? [
                    'id' => $project->evaluator->id,
                    'name' => $project->evaluator->user->name,
                    'email' => $project->evaluator->user->email,
                ] : null,
                'submission_date' => $project->created_at?->format('Y-m-d H:i:s'),
                'total_score' => $latestEvaluation?->total_score,
                'revision_count' => $project->revision_count ?? 0,
                'remarks' => $project->remarks,
                'for_revision_remarks' => $project->for_revision_remarks,
                'documents' => $documents,
                'evaluation' => $evaluation,
                'interpretations' => $interpretations,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching project details', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Error fetching project details: ' . $e->getMessage()], 500);
        }
    }

    public function show($projectId)
    {
        try {
            $project = Project::with([
                'proponent.user',
                'domainExpertise',
                'implementationPhase',
                'projectStatus',
                'evaluator.user',
                'documents.documentType',
                'evaluations' => function ($q) { $q->whereIn('status_id', [2, 3, 4])->latest(); }
            ])->findOrFail($projectId);

            $documents = $project->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'original_name' => $doc->file_name,
                    'type' => $doc->documentType?->name ?? 'Document',
                    'download_route' => route('admin1.assignments.document-download', $doc->id),
                ];
            });

            // Get evaluation data
            $evaluations = [];
            $latestEvaluation = $project->evaluations->first();
            
            if ($latestEvaluation) {
                $interpretations = \App\Models\ScoreInterpretation::orderBy('score_min')->get();
                
                // Map status_id to status_name: 2=revision, 3=approved, 4=declined
                $statusMap = [2 => 'revision', 3 => 'approved', 4 => 'declined'];
                $statusName = $statusMap[$latestEvaluation->status_id] ?? 'unknown';
                
                $evaluations[] = [
                    'id' => $latestEvaluation->id,
                    'total_score' => $latestEvaluation->total_score,
                    'remarks' => $latestEvaluation->final_remarks,
                    'status_name' => $statusName,
                    'interpretation' => $latestEvaluation->interpretation ? [
                        'interpretation' => $latestEvaluation->interpretation->interpretation,
                        'description' => $latestEvaluation->interpretation->description,
                    ] : null,
                    'evaluator' => $latestEvaluation->evaluator?->user?->name,
                    'created_at' => $latestEvaluation->created_at?->format('Y-m-d H:i:s'),
                ];
            }

            return Inertia::render('admin1/assignments/show', [
                'project' => [
                    'id' => $project->id,
                    'project_code' => $project->project_code,
                    'title' => $project->project_title,
                    'domain' => $project->domainExpertise?->domain_name,
                    'implementation_phase' => $project->implementationPhase?->name,
                    'status' => $project->projectStatus?->name === 'for_correction' ? 'revision' : $project->projectStatus?->name,
                    'status_id' => $project->project_status_id,
                    'description' => $project->project_description,
                    'rationale' => $project->rationale,
                    'objectives' => $project->objectives,
                    'created_at' => $project->created_at?->format('Y-m-d H:i:s'),
                    'documents' => $documents,
                    'evaluations' => $evaluations,
                    'current_evaluator' => $project->evaluator ? [
                        'id' => $project->evaluator->id,
                        'name' => $project->evaluator->user->name,
                        'email' => $project->evaluator->user->email,
                    ] : null,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in AssignmentController@show', [
                'project_id' => $projectId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin1.assignments.index')->with('error', 'Project not found');
        }
    }

    public function downloadDocument($documentId)
    {
        try {
            $document = ProjectDocument::findOrFail($documentId);

            // Check if the file path exists in the public disk
            if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
                return response()->json(['message' => 'Document file not found'], 404);
            }

            // Download the file from public disk
            $downloadName = $document->file_name ?: basename($document->file_path);
            return Storage::disk('public')->download($document->file_path, $downloadName);
        } catch (\Exception $e) {
            \Log::error('Error downloading document', [
                'document_id' => $documentId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Error downloading document: ' . $e->getMessage()], 500);
        }
    }
}
