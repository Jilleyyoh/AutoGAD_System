<?php

namespace App\Http\Controllers;

use App\Models\DomainExpertise;
use App\Models\ImplementationPhase;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Models\ProjectDocumentType;
use App\Models\ProjectStatus;
use App\Models\Certificate;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ProponentPAPController extends Controller
{
    public function dashboard()
    {
        $proponent = auth()->user()->proponent;
        
        $projects = Project::where('proponent_id', $proponent->id)
            ->with(['projectStatus'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) {
                $statusName = $p->projectStatus?->name ?? 'for_evaluation';
                // Normalize legacy status name 'for_correction' -> 'revision'
                if ($statusName === 'for_correction') {
                    $statusName = 'revision';
                }

                return [
                    'id' => $p->id,
                    'title' => $p->project_title,
                    'status' => $statusName,
                    'created_at' => $p->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('proponent/dashboard', [
            'projects' => $projects,
            'proponent' => [
                'id' => $proponent->id,
                'name' => auth()->user()->name,
                'organization' => $proponent->organization,
                'email' => auth()->user()->email,
                'total_paps' => count($projects),
            ],
        ]);
    }

    /**
     * Track Submissions list view with filters.
     */
    public function submissions(Request $request)
    {
        $proponent = optional(auth()->user())->proponent;
        abort_unless($proponent, 403);

        $status = $request->query('status');
        $from = $request->query('from');
        $to = $request->query('to');
        $highlightProjectId = $request->query('highlight');
        if ($highlightProjectId) {
            $highlightProjectId = (int) $highlightProjectId;
        }

        $query = Project::with(['domainExpertise','projectStatus'])
            ->where('proponent_id', $proponent->id);

        if ($status) {
            $query->whereHas('projectStatus', function($q) use ($status) { $q->where('name', $status); });
        }
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $projects = $query->orderByDesc('created_at')->paginate(10)->through(function ($p) {
                $statusName = $p->projectStatus?->name ?? 'for_evaluation';
                if ($statusName === 'for_correction') {
                    $statusName = 'revision';
                }

            return [
                'id' => $p->id,
                'project_code' => $p->project_code,
                'title' => $p->project_title,
                'domain' => $p->domainExpertise?->domain_name,
                'status' => $statusName,
                'created_at' => $p->created_at?->toDateTimeString(),
            ];
        });

      $statusOptions = [
        'for_evaluation'    => 'For Evaluation',
        'revision'          => 'Revision',
        'approved'          => 'Approved',
        'declined'          => 'Declined',
        'for_certification' => 'For Certification',
        'certified'         => 'Certified',
      ];

      return Inertia::render('proponent/pap/submissions/index', [
          'filters' => [ 'status' => $status, 'from' => $from, 'to' => $to ],
          'projects' => $projects,
          // Provide keyed status options with labels for the frontend
          'statusOptions' => $statusOptions,
          'highlightProjectId' => $highlightProjectId,
      ]);
    }

    /**
     * Detailed submission view (evaluation details included).
     */
    public function submissionShow(Project $project)
    {
        $proponent = optional(auth()->user())->proponent;
        abort_unless($proponent && $project->proponent_id === $proponent->id, 403);

        $project->load([
            'domainExpertise',
            'implementationPhase',
            'projectStatus',
            'documents.documentType',
            'evaluations' => function($q) { $q->whereIn('status_id', [2, 3, 4])->latest(); },
            'evaluations.evaluator',
            'evaluations.interpretation',
            'certificate.issuedBy',
        ]);

        $evaluations = $project->evaluations->map(function ($e) {
            return [
                'id' => $e->id,
                'total_score' => $e->total_score ?? $e->score ?? null,
                'remarks' => $e->final_remarks ?? $e->comments ?? null,
                'status_id' => $e->status_id,
                'status_name' => $this->getEvaluationStatusName($e->status_id),
                'interpretation' => $e->interpretation ? [
                    'interpretation' => $e->interpretation->interpretation,
                    'description' => $e->interpretation->description,
                ] : null,
                'evaluator' => $e->evaluator?->name,
                'created_at' => $e->created_at?->toDateTimeString(),
            ];
        });

        $documents = $project->documents->map(function ($d) {
            $path = $d->file_path;
            $download = route('proponent.pap.document.download', $d->id);
            return [
                'id' => $d->id,
                'type' => $d->documentType?->name ?? 'unknown',
                'original_name' => $d->original_name ?? $d->file_name,
                'download_route' => $download,
            ];
        });

        $certificateData = null;
        if ($project->certificate) {
            $certificateData = [
                'id' => $project->certificate->id,
                'certificate_number' => $project->certificate->certificate_number,
                'certificate_code' => $project->certificate->certificate_code,
                'issued_date' => $project->certificate->issued_date?->format('Y-m-d'),
                'issued_by' => $project->certificate->issuedBy?->name ?? 'System',
                'download_route' => route('proponent.certificates.download', $project->certificate->id),
            ];
            \Log::info('Certificate data prepared', ['certificateData' => $certificateData]);
        }

        $statusName = $project->projectStatus?->name ?? 'for_evaluation';
        if ($statusName === 'for_correction') {
            $statusName = 'revision';
        }

        $responseData = [
            'project' => [
                'id' => $project->id,
                'project_code' => $project->project_code,
                'title' => $project->project_title,
                'domain' => $project->domainExpertise?->domain_name,
                'phase' => $project->implementationPhase?->name,
                'status' => $statusName,
                'status_id' => $project->project_status_id,
                'created_at' => $project->created_at?->toDateTimeString(),
                'description' => $project->project_description,
                'rationale' => $project->rationale,
                'objectives' => $project->objectives,
                'documents' => $documents,
                'evaluations' => $evaluations,
                'certificate' => $certificateData,
            ],
            'domains' => DomainExpertise::orderBy('domain_name')->get()->map(function($d){ return ['id'=>$d->id,'domain_name'=>$d->domain_name]; }),
            'phases' => ImplementationPhase::orderBy('name')->get()->map(function($p){ return ['id'=>$p->id,'name'=>$p->name]; }),
        ];
        
        return Inertia::render('proponent/pap/submissions/show', $responseData);
    }

    private function getEvaluationStatusName($statusId)
    {
        $statusMap = [
            2 => 'revision',
            3 => 'approved',
            4 => 'declined',
        ];
        return $statusMap[$statusId] ?? 'unknown';
    }

    public function create()
    {
        $domains = DomainExpertise::orderBy('domain_name')->get();
        $phases = ImplementationPhase::orderBy('name')->get();

        // Convert phase names to title case for display
        $phasesFormatted = $phases->map(function ($phase) {
            return [
                'id' => $phase->id,
                'name' => ucfirst($phase->name), // Capitalize first letter for display
                'value' => $phase->name // Keep original value for form submission
            ];
        });

        return Inertia::render('proponent/pap/create', [
            'domains' => $domains,
            'phases' => $phasesFormatted
        ]);
    }

    public function store(Request $request)
    {
        Log::info('PAP store request received', [
            'user_id' => auth()->id(),
            'has_proponent' => (bool) optional(auth()->user())->proponent,
            'payload_keys' => array_keys($request->all()),
        ]);

        $proponent = optional(auth()->user())->proponent;
        if (!$proponent) {
            Log::warning('PAP store aborted: missing proponent relation', ['user_id' => auth()->id()]);
            return back()->withErrors(['general' => 'Proponent profile not found. Cannot submit PAP.']);
        }
        // Validate incoming fields (front-end sends 'domain_id' & 'implementation_phase_id')
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'domain_id' => ['required', 'exists:domain_expertises,id'],
            'implementation_phase_id' => ['required', 'exists:implementation_phases,id'],
            'description' => ['required', 'string'],
            'rationale' => ['nullable', 'string'],
            'objectives' => ['nullable', 'string'],
            'proposal' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'memo' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'manual' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'supporting_documents' => ['nullable', 'array'],
            'supporting_documents.*.description' => ['required_with:supporting_documents.*.file', 'string', 'max:255'],
            'supporting_documents.*.file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'supporting_documents_link' => ['nullable', 'string', 'max:500'],
        ]);

    // Ensure a "for_evaluation" project status exists and use it as the default
    $pendingStatus = ProjectStatus::firstOrCreate(['name' => 'for_evaluation']);

        // Generate a simple project code (customize as needed)
        $projectCode = 'PRJ-' . now()->format('YmdHis') . '-' . substr(bin2hex(random_bytes(3)), 0, 6);

        $project = \DB::transaction(function () use ($validated, $projectCode, $pendingStatus, $proponent) {
            return Project::create([
                'project_code' => $projectCode,
                'project_title' => $validated['title'],
                'project_description' => $validated['description'],
                'rationale' => $validated['rationale'] ?? null,
                'objectives' => $validated['objectives'] ?? null,
                'implementation_phase_id' => $validated['implementation_phase_id'],
                'proponent_id' => $proponent->id,
                'domain_expertise_id' => $validated['domain_id'],
                'project_status_id' => $pendingStatus->id,
            ]);
        });

        if (!$project) {
            return back()->withErrors(['general' => 'Failed to create project.']);
        }

        // Send notification to Admin1 (new project submitted)
        NotificationService::notifyAdmin1ProjectSubmitted($project, false);

        Log::info('PAP project created', [
            'project_id' => $project->id,
            'code' => $project->project_code,
            'title' => $project->project_title,
            'implementation_phase_id' => $project->implementation_phase_id,
            'domain_expertise_id' => $project->domain_expertise_id,
            'project_status_id' => $project->project_status_id,
            'projects_count_after' => Project::count(),
        ]);

        // Primary documents
        $this->storeDocument($project, $request->file('proposal'), 'proposal');
        $this->storeDocument($project, $request->file('memo'), 'memo');
        $this->storeDocument($project, $request->file('manual'), 'manual');

        Log::info('Primary documents processed', [
            'project_id' => $project->id,
            'has_proposal' => (bool)$request->file('proposal'),
            'has_memo' => (bool)$request->file('memo'),
            'has_manual' => (bool)$request->file('manual'),
        ]);

        // Supporting documents (array of objects with file + description)
        if ($request->has('supporting_documents')) {
            foreach ($request->supporting_documents as $doc) {
                if (isset($doc['file']) && $doc['file']) {
                    $this->storeDocument($project, $doc['file'], 'supporting', $doc['description'] ?? null);
                }
            }
            Log::info('Supporting documents processed', [
                'project_id' => $project->id,
                'supporting_count_input' => count($request->supporting_documents)
            ]);
        }

        // Supporting documents link (Google Drive, OneDrive, etc.)
        if ($request->has('supporting_documents_link') && $request->input('supporting_documents_link')) {
            $this->storeDocumentLink($project, $request->input('supporting_documents_link'), 'supporting');
            Log::info('Supporting documents link processed', [
                'project_id' => $project->id,
                'has_link' => true
            ]);
        }

        Log::info('Redirecting to PAP show', ['project_id' => $project->id]);
        return redirect()->route('proponent.pap.show', $project->id)
            ->with('success', 'Project Approval Proposal submitted successfully.');
    }

    public function show(Project $project)
    {
        // Ensure the proponent can only view their own projects
        if ($project->proponent_id !== auth()->user()->proponent->id) {
            abort(403);
        }

        $project->load(['domainExpertise', 'implementationPhase', 'projectStatus', 'documents.documentType']);

        // Transform to simplified structure expected by current frontend
        $statusName = $project->projectStatus?->name ?? 'pending';
        if ($statusName === 'for_correction') {
            $statusName = 'for_revision';
        }

        $transformed = [
            'id' => $project->id,
            'project_code' => $project->project_code,
            'title' => $project->project_title,
            'description' => $project->project_description,
            'phase' => $project->implementationPhase?->name,
            'status' => $statusName,
            'status_id' => $project->status_id,
            'created_at' => $project->created_at?->toDateTimeString(),
            'domain_expertise' => $project->domainExpertise ? [
                'id' => $project->domainExpertise->id,
                'domain_name' => $project->domainExpertise->domain_name,
            ] : null,
            'documents' => $project->documents->map(function ($d) {
                $path = $d->file_path;
                $publicUrl = null;
                if ($path && Storage::disk('public')->exists($path)) {
                    $publicUrl = Storage::disk('public')->url($path);
                }
                return [
                    'id' => $d->id,
                    'type' => $d->documentType?->name ?? 'unknown',
                    'description' => $d->description,
                    'file_path' => $publicUrl,
                    'file_name' => $d->file_name,
                    'download_route' => route('proponent.pap.document.download', $d->id),
                ];
            }),
        ];

        return Inertia::render('proponent/pap/show', [
            'project' => $transformed
        ]);
    }

    public function uploadDocuments(Request $request, Project $project)
    {
        $request->validate([
            'documents' => ['required', 'array'],
            'documents.*.file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'documents.*.type' => ['required', 'string', 'in:proposal,memo,manual,supporting'],
            'documents.*.description' => ['required_when:documents.*.type,supporting', 'nullable', 'string', 'max:255'],
        ]);

        foreach ($request->documents as $document) {
            if ($document['file']) {
                $this->storeDocument(
                    $project, 
                    $document['file'], 
                    $document['type'], 
                    $document['description'] ?? null
                );
            }
        }

        // If the project was sent back for revision, mark it as 'revised' when the
        // proponent uploads revised documents so Admin/Evaluator can pick it up.
                // If the project was sent back for revision, transition it to 'for_evaluation'
                // after the proponent uploads revised documents so Admin/Evaluator can pick it up.
                try {
                    $forRevision = ProjectStatus::where('name', 'revision')->first();
                    if ($forRevision && $project->project_status_id === $forRevision->id) {
                        $forEvaluation = ProjectStatus::firstOrCreate(['name' => 'for_evaluation']);
                        $project->project_status_id = $forEvaluation->id;
                        $project->save();
                        Log::info('Project status updated to for_evaluation after proponent upload', ['project_id' => $project->id]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to auto-transition project status after document upload', ['project_id' => $project->id, 'error' => $e->getMessage()]);
                    // Don't block document upload on status update failure; continue.
                }

        return back()->with('success', 'Documents uploaded successfully');
    }

    /**
     * Show revision form with evaluator remarks and pre-filled project data
     */
    public function reviseShow(Request $request, Project $project)
    {
        $proponent = optional(auth()->user())->proponent;
        abort_unless($proponent && $project->proponent_id === $proponent->id, 403);

        // Get evaluator remarks - look for evaluations with final_remarks
        // (status_id: 2=revision, 3=approved, 4=decline)
        $evaluation = $project->evaluations()
            ->whereIn('status_id', [2, 3, 4]) // Any completed evaluation with remarks
            ->latest()
            ->first();

        $remarks = $evaluation?->final_remarks ?? 'No remarks provided';

        // Get project documents
        $documents = $project->documents->map(function ($d) {
            return [
                'id' => $d->id,
                'original_name' => $d->original_name,
                'type' => $d->documentType?->name ?? 'supporting',
                'download_route' => route('proponent.pap.document.download', $d->id),
            ];
        });

        // Get supporting documents link from existing project document
        $supportingDocType = ProjectDocumentType::firstOrCreate(['name' => 'supporting']);
        $supportingDocLink = $project->documents()
            ->where('document_type_id', $supportingDocType->id)
            ->whereNotNull('drive_link')
            ->first();
        $supportingDocumentsLink = $supportingDocLink?->drive_link ?? '';

        // Get domains and phases for dropdowns
        $domains = DomainExpertise::all(['id', 'domain_name as name'])->toArray();
        $phases = ImplementationPhase::all(['id', 'name'])->toArray();

        return Inertia::render('proponent/pap/revise', [
            'project' => [
                'id' => $project->id,
                'project_code' => $project->project_code,
                'title' => $project->project_title,
                'domain_id' => $project->domain_expertise_id,
                'implementation_phase_id' => $project->implementation_phase_id,
                'description' => $project->project_description,
                'rationale' => $project->rationale,
                'objectives' => $project->objectives,
                'supporting_documents_link' => $supportingDocumentsLink,
            ],
            'remarks' => $remarks,
            'documents' => $documents,
            'domains' => $domains,
            'phases' => $phases,
        ]);
    }

    /**
     * Revise project: allow proponent to update project details and upload documents
     * This endpoint will accept editable fields and files, apply changes, and
     * transition the project to 'for_evaluation'.
     */
    public function revise(Request $request, Project $project)
    {
        $proponent = optional(auth()->user())->proponent;
        abort_unless($proponent && $project->proponent_id === $proponent->id, 403);

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'domain_id' => ['required', 'exists:domain_expertises,id'],
            'implementation_phase_id' => ['required', 'exists:implementation_phases,id'],
            'description' => ['required', 'string'],
            'rationale' => ['nullable', 'string'],
            'objectives' => ['nullable', 'string'],
            'documents' => ['nullable', 'array'],
            'documents.*.file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'documents.*.type' => ['nullable', 'string', 'in:proposal,memo,manual,supporting'],
            'documents.*.description' => ['nullable', 'string', 'max:255'],
            'supporting_documents_link' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            // Log incoming payload for debugging when proponents report missing edits
            Log::info('Proponent revise request', [
                'project_id' => $project->id,
                'user_id' => auth()->id(),
                'input_keys' => array_keys($request->all()),
                'has_files' => !empty($request->allFiles()),
            ]);

            DB::transaction(function () use ($request, $project) {
                // Update core fields
                $project->update([
                    'project_title' => $request->input('title'),
                    'domain_expertise_id' => $request->input('domain_id'),
                    'implementation_phase_id' => $request->input('implementation_phase_id'),
                    'project_description' => $request->input('description'),
                    'rationale' => $request->input('rationale'),
                    'objectives' => $request->input('objectives'),
                ]);

                // Handle documents if provided (reuse storeDocument helper)
                // Process all documents - storeDocument() handles deletion of old primary docs
                // Supporting docs will be deleted first, then new ones added
                if ($request->has('documents') && is_array($request->input('documents'))) {
                    foreach ($request->input('documents') as $idx => $document) {
                        $file = $request->file("documents.$idx.file");
                        $docType = $document['type'] ?? 'supporting';
                        if ($file) {
                            // storeDocument() already handles:
                            // - For primary docs: deletes old doc of same type before storing new one
                            // - For supporting docs: skips deletion (we handle that separately)
                            $this->storeDocument(
                                $project,
                                $file,
                                $docType,
                                $document['description'] ?? null
                            );
                        }
                    }
                }

                // Clean up: Delete old supporting docs if NO new supporting docs were uploaded during revision
                // This prevents orphaned supporting docs when proponent only updates primary docs
                $supportingDocType = ProjectDocumentType::firstOrCreate(['name' => 'supporting']);
                $hasNewSupportingDocs = false;
                if ($request->has('documents')) {
                    foreach ($request->input('documents') as $idx => $document) {
                        if (($document['type'] ?? null) === 'supporting' && $request->file("documents.$idx.file")) {
                            $hasNewSupportingDocs = true;
                            break;
                        }
                    }
                }
                // Only delete old supporting docs if NO new supporting docs were uploaded
                if (!$hasNewSupportingDocs) {
                    ProjectDocument::where('project_id', $project->id)
                        ->where('document_type_id', $supportingDocType->id)
                        ->delete();
                }

                // Handle supporting documents link if provided
                // If a link is provided, create/update it as a supporting document
                if ($request->has('supporting_documents_link') && $request->input('supporting_documents_link')) {
                    $this->storeDocumentLink($project, $request->input('supporting_documents_link'), 'supporting');
                }

                // Ensure revised status is applied
                            // After proponent revision, transition project to 'for_evaluation' so it
                            // can be picked up by Admin/Evaluator for reassignment.
                            $forEvaluation = ProjectStatus::firstOrCreate(['name' => 'for_evaluation']);
                            $project->project_status_id = $forEvaluation->id;
                            $project->increment('revision_count'); // Track that this project has been revised
                            $project->save();
            });

            // Send notification to Admin1 (project revised)
            NotificationService::notifyAdmin1ProjectSubmitted($project, true);

            // Send notification to evaluator (project revised)
            if ($project->evaluator) {
                NotificationService::notifyEvaluatorProjectRevised($project, $project->evaluator);
            }

            // Reload relationships for response
            $project->load(['projectStatus','documents.documentType']);

            // Return updated fields so front-end can refresh state without relying solely on a redirect
            return response()->json([
                'message' => 'Project revised and resubmitted',
                'project' => [
                    'id' => $project->id,
                    'status' => $project->project_status_id,
                    'status_name' => ($project->projectStatus?->name === 'for_correction' ? 'revision' : $project->projectStatus?->name),
                    'title' => $project->project_title,
                    'description' => $project->project_description,
                    'domain_expertise_id' => $project->domain_expertise_id,
                    'implementation_phase_id' => $project->implementation_phase_id,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error revising project', ['project_id' => $project->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to revise project: ' . $e->getMessage()], 500);
        }
    }

    private function storeDocument(Project $project, $file, string $typeName, ?string $description = null): ?ProjectDocument
    {
        if (!$file) {
            return null;
        }

        // Find or create a document type record
        $docType = ProjectDocumentType::firstOrCreate(['name' => $typeName]);

        // For non-supporting docs, keep only the latest version (delete previous of same type)
        if ($typeName !== 'supporting') {
            ProjectDocument::where('project_id', $project->id)
                ->where('document_type_id', $docType->id)
                ->delete();
        }

        // Store in public disk so it can be served via /storage symlink
        $storedPath = $file->store('project-documents', 'public');

        return ProjectDocument::create([
            'project_id' => $project->id,
            'document_type_id' => $docType->id,
            'file_path' => $storedPath,
            'file_name' => $file->getClientOriginalName(),
            'description' => $description,
            'upload_date' => now(),
        ]);
    }

    private function storeDocumentLink(Project $project, string $link, string $typeName): ?ProjectDocument
    {
        if (!$link) {
            return null;
        }

        // Find or create a document type record
        $docType = ProjectDocumentType::firstOrCreate(['name' => $typeName]);

        // For document links, delete any existing document of same type (to keep only latest link)
        // This handles both file-based and link-based documents
        ProjectDocument::where('project_id', $project->id)
            ->where('document_type_id', $docType->id)
            ->delete();

        // Store the link without file path
        return ProjectDocument::create([
            'project_id' => $project->id,
            'document_type_id' => $docType->id,
            'drive_link' => $link,
            'file_path' => null,
            'file_name' => null,
            'description' => 'Shared link to supporting documents',
            'upload_date' => now(),
        ]);
    }

    /* ================= Draft Support (Session-based) ================= */
    public function getDraft()
    {
        return response()->json([
            'draft' => session('pap_draft')
        ]);
    }

    public function saveDraft(Request $request)
    {
        // Extract only serializable data (no files) for session storage
        $payload = [];
        
        foreach ($request->except(['_token']) as $key => $value) {
            // Skip file uploads and arrays (supporting_documents, etc)
            if ($key === 'supporting_documents' || $key === 'documents') {
                // Store only descriptions for supporting docs, not files
                if (is_array($value)) {
                    $payload[$key] = array_map(function ($doc) {
                        return [
                            'description' => $doc['description'] ?? '',
                        ];
                    }, $value);
                }
            } elseif (!($value instanceof \Symfony\Component\HttpFoundation\File\UploadedFile)) {
                // Store non-file values
                $payload[$key] = $value;
            }
        }
        
        session(['pap_draft' => $payload]);
        return response()->json(['status' => 'ok']);
    }

    /**
     * Download a project document (proponent authorized).
     */
    public function downloadDocument(ProjectDocument $document)
    {
        $userProponent = optional(auth()->user())->proponent;
        abort_unless($userProponent && $document->project->proponent_id === $userProponent->id, 403);

        if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Document file not found');
        }

        $downloadName = $document->file_name ?: basename($document->file_path);
        return Storage::disk('public')->download($document->file_path, $downloadName);
    }

    /**
     * Download certificate PDF for a certified project
     */
    public function downloadCertificate(Certificate $certificate)
    {
        try {
            // Verify the certificate belongs to a project owned by the proponent
            $userProponent = optional(auth()->user())->proponent;
            abort_unless($userProponent && $certificate->project->proponent_id === $userProponent->id, 403);

            // Load relationships
            $certificate->load([
                'project.proponent.user',
                'project.domainExpertise',
                'project.implementationPhase',
                'project.evaluations' => function ($query) {
                    $query->where('status_id', 3);
                },
                'issuedBy'
            ]);

            // Verify project has completed evaluations
            if ($certificate->project->evaluations->isEmpty()) {
                abort(403, 'No completed evaluations for this project');
            }

            // Calculate average score
            $averageScore = $certificate->project->evaluations->avg('total_score');

            // Get interpretation
            $interpretation = \App\Models\ScoreInterpretation::where('score_min', '<=', $averageScore)
                ->where('score_max', '>=', $averageScore)
                ->first(['interpretation', 'description']);

            // Prepare data for PDF
            $data = [
                'certificate_number' => $certificate->certificate_number,
                'issue_date' => $certificate->issued_date->format('F d, Y'),
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

            // Generate PDF using view
            $pdf = Pdf::loadView('certificates.gad-certificate', $data);

            return $pdf->download('Certificate-' . $certificate->certificate_number . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Error downloading certificate', [
                'certificate_id' => $certificate->id,
                'message' => $e->getMessage()
            ]);

            abort(500, 'Failed to download certificate');
        }
    }

    /**
     * Local-only debug endpoint to confirm the active DB connection & paths.
     */
    public function dbDebug()
    {
        abort_unless(app()->environment('local'), 403);
        $conn = \DB::connection();
        $driver = $conn->getDriverName();
        $database = config('database.connections.' . config('database.default') . '.database');
        $isAbsolute = is_string($database) && str_starts_with($database, DIRECTORY_SEPARATOR);
        $guessedAbsolute = $isAbsolute ? $database : base_path(trim($database, '/'));
        $existsGuessed = file_exists($guessedAbsolute);
        $realResolved = $existsGuessed ? realpath($guessedAbsolute) : false;
        $projectsCount = Project::count();
        $documentsCount = ProjectDocument::count();
        return response()->json([
            'driver' => $driver,
            'default_connection' => config('database.default'),
            'database_config_value' => $database,
            'is_absolute' => $isAbsolute,
            'guessed_absolute_path' => $guessedAbsolute,
            'guessed_exists' => $existsGuessed,
            'database_realpath' => $realResolved,
            'projects_count' => $projectsCount,
            'documents_count' => $documentsCount,
            'sample_projects' => Project::orderByDesc('id')->limit(3)->get(['id','project_code','project_title','created_at']),
        ]);
    }
}