<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Evaluator;
use App\Models\AssignmentLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AssignmentController extends Controller
{
    public function index()
    {
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
                'proponent',
                'domainExpertise',
                'implementationPhase',
                'evaluator'
            ])
            ->orderBy('projects.created_at', 'desc')
            ->get();

        return Inertia::render('admin1/Assignments/Index', [
            'projects' => $projects->map(function ($project) {
                $data = [
                    'id' => $project->id,
                    'project_code' => $project->project_code,
                    'title' => $project->project_title,
                    'status' => $project->project_status_id,
                    'submission_date' => $project->created_at,
                    'domain_id' => $project->domain_expertise_id,
                    'implementation_phase_id' => $project->implementation_phase_id,
                ];

                if ($project->proponent) {
                    $data['proponent'] = [
                        'id' => $project->proponent->id,
                        'organization' => [
                            'id' => $project->proponent->id,
                            'name' => $project->proponent->organization
                        ]
                    ];
                }

                if ($project->domainExpertise) {
                    $data['domainExpertise'] = [
                        'id' => $project->domainExpertise->id,
                        'name' => $project->domainExpertise->name
                    ];
                }

                if ($project->implementationPhase) {
                    $data['implementationPhase'] = [
                        'id' => $project->implementationPhase->id,
                        'name' => $project->implementationPhase->name
                    ];
                }

                if ($project->evaluator) {
                    $data['evaluator'] = [
                        'id' => $project->evaluator->id,
                        'name' => $project->evaluator->name,
                        'email' => $project->evaluator->email
                    ];
                } else {
                    $data['evaluator'] = null;
                }

                return $data;
            })
        ]);
    }

    public function getEvaluators(Request $request, $domainId)
    {
        $evaluators = Evaluator::whereHas('domains', function($query) use ($domainId) {
            $query->where('domain_expertise.domain_id', $domainId);
        })->get();

        return response()->json($evaluators);
    }

    public function assignEvaluator(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'evaluator_id' => 'required|exists:evaluators,id',
        ]);

        DB::transaction(function () use ($request) {
            $project = Project::findOrFail($request->project_id);
            
            // Create assignment log
            AssignmentLog::create([
                'project_id' => $request->project_id,
                'evaluator_id' => $request->evaluator_id,
                'assigned_by' => auth()->id(),
                'status' => 'active'
            ]);

            // Update project status if needed
            if ($project->status === 'on_hold') {
                $project->update(['status' => 'for_evaluation']);
            }
        });

        return response()->json(['message' => 'Evaluator assigned successfully']);
    }

    public function unassignEvaluator(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'evaluator_id' => 'required|exists:evaluators,id',
        ]);

        DB::transaction(function () use ($request) {
            AssignmentLog::where([
                'project_id' => $request->project_id,
                'evaluator_id' => $request->evaluator_id,
                'status' => 'active'
            ])->update(['status' => 'inactive']);
        });

        return response()->json(['message' => 'Evaluator unassigned successfully']);
    }
}