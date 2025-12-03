<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DomainExpertiseController;
use App\Http\Controllers\EvaluatorController;
use App\Http\Controllers\ProponentController;
use App\Http\Controllers\Admin1\NotificationsController as Admin1NotificationsController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Default dashboard redirects based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        switch ($user->role_id) {
            case 1: // Proponent
                return redirect()->route('proponent.dashboard');
            case 2: // Evaluator
                return redirect()->route('evaluator.dashboard');
            case 3: // Admin 1
                return redirect()->route('admin1.dashboard');
            case 4: // Admin 2
                return redirect()->route('admin2.dashboard');
            default:
                return Inertia::render('dashboard');
        }
    })->name('dashboard');

    // Admin 1:
    Route::middleware(['auth', 'role:3'])->group(function () {
        // Admin 1 Dashboard
        Route::get('/admin1/dashboard', function () {
            return Inertia::render('admin1/dashboard');
        })->name('admin1.dashboard');

        // Admin 1: Project Assignments
        Route::prefix('admin1/assignments')->name('admin1.assignments.')->group(function() {
            Route::get('/', [\App\Http\Controllers\Admin1\AssignmentController::class, 'index'])->name('index');
            Route::get('/{projectId}', [\App\Http\Controllers\Admin1\AssignmentController::class, 'show'])->name('show');
            Route::get('/evaluators/{domainId}', [\App\Http\Controllers\Admin1\AssignmentController::class, 'getEvaluators'])->name('evaluators');
            Route::get('/project/{projectId}', [\App\Http\Controllers\Admin1\AssignmentController::class, 'getProjectDetails'])->name('project-details');
            Route::get('/download/{documentId}', [\App\Http\Controllers\Admin1\AssignmentController::class, 'downloadDocument'])->name('document-download');
            Route::post('/assign', [\App\Http\Controllers\Admin1\AssignmentController::class, 'assignEvaluator'])->name('assign');
            Route::post('/reassign-proponent', [\App\Http\Controllers\Admin1\AssignmentController::class, 'reassignToProponent'])->name('reassign.proponent');
            Route::post('/unassign', [\App\Http\Controllers\Admin1\AssignmentController::class, 'unassignEvaluator'])->name('unassign');
        });

        // Admin 1: Domain Expertise CRUD
        Route::resource('domain-expertise', DomainExpertiseController::class)
            ->names([
                'index' => 'domain.index',
                'create' => 'domain.create',
                'store' => 'domain.store',
                'edit' => 'domain.edit',
                'update' => 'domain.update',
                'destroy' => 'domain.destroy',
            ])->parameters([
                'domain-expertise' => 'domainExpertise'
            ]);
    
        // Admin 1: Evaluator CRUD
        Route::resource('evaluators', EvaluatorController::class)
            ->names([
                'index' => 'evaluators.index',
                'create' => 'evaluators.create',
                'store' => 'evaluators.store',
                'edit' => 'evaluators.edit',
                'update' => 'evaluators.update',
                'destroy' => 'evaluators.destroy',
            ])->parameters([
                'evaluators' => 'evaluator'
            ]);

        // Admin 1: Questionnaire Management
        Route::prefix('questionnaire')->name('questionnaire.')->group(function () {
            Route::get('/', [\App\Http\Controllers\QuestionnaireSettingController::class, 'index'])->name('index');
            Route::post('/settings', [\App\Http\Controllers\QuestionnaireSettingController::class, 'updateSettings'])->name('updateSettings');
            
            // Questionnaire Versions
            Route::get('/versions', [\App\Http\Controllers\QuestionnaireVersionController::class, 'index'])->name('versions.index');
            Route::post('/versions', [\App\Http\Controllers\QuestionnaireVersionController::class, 'store'])->name('versions.store');
            Route::get('/versions/{version}', [\App\Http\Controllers\QuestionnaireVersionController::class, 'show'])->name('versions.show');
            Route::post('/versions/{version}/archive', [\App\Http\Controllers\QuestionnaireVersionController::class, 'archive'])->name('versions.archive');
            Route::post('/versions/compare', [\App\Http\Controllers\QuestionnaireVersionController::class, 'compare'])->name('versions.compare');
            Route::get('/versions/{version}/snapshot', [\App\Http\Controllers\QuestionnaireVersionController::class, 'snapshot'])->name('versions.snapshot');
            
            // Questionnaire Categories CRUD
            Route::post('/categories', [\App\Http\Controllers\QuestionnaireCategoryController::class, 'store'])->name('categories.store');
            Route::put('/categories/{category}', [\App\Http\Controllers\QuestionnaireCategoryController::class, 'update'])->name('categories.update');
            Route::delete('/categories/{category}', [\App\Http\Controllers\QuestionnaireCategoryController::class, 'destroy'])->name('categories.destroy');

            // Questionnaire Items CRUD
            Route::post('/items', [\App\Http\Controllers\QuestionnaireItemController::class, 'store'])->name('items.store');
            Route::put('/items/{item}', [\App\Http\Controllers\QuestionnaireItemController::class, 'update'])->name('items.update');
            Route::patch('/items/{item}/status', [\App\Http\Controllers\QuestionnaireItemController::class, 'updateStatus'])->name('items.updateStatus');
            Route::delete('/items/{item}', [\App\Http\Controllers\QuestionnaireItemController::class, 'destroy'])->name('items.destroy');

            // Score Interpretations CRUD
            Route::post('/interpretations', [\App\Http\Controllers\ScoreInterpretationController::class, 'store'])->name('interpretations.store');
            Route::put('/interpretations/{scoreInterpretation}', [\App\Http\Controllers\ScoreInterpretationController::class, 'update'])->name('interpretations.update');
            Route::delete('/interpretations/{scoreInterpretation}', [\App\Http\Controllers\ScoreInterpretationController::class, 'destroy'])->name('interpretations.destroy');
        });

        // Admin 1: Certificates (view all certified projects)
        Route::prefix('admin1/certificates')->name('admin1.certificates.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin1\CertificateController::class, 'index'])->name('index');
            Route::get('/{certificate}/download', [\App\Http\Controllers\Admin1\CertificateController::class, 'download'])->name('download');
        });

        // Admin 1: Notifications
        Route::prefix('admin1/notifications')->name('admin1.notifications.')->group(function () {
            Route::get('/', [Admin1NotificationsController::class, 'index'])->name('index');
        });
    });

    // Admin 2:
    Route::middleware(['role:4'])->group(function () {
        // Admin 2 Dashboard
        Route::get('/admin2/dashboard', function () {
            return Inertia::render('admin2/dashboard');
        })->name('admin2.dashboard');

        // Admin 2: Proponent CRUD
        Route::prefix('admin2')->group(function () {
            Route::resource('proponents', ProponentController::class)
                ->names([
                    'index' => 'admin2.proponents.index',
                    'create' => 'admin2.proponents.create',
                    'store' => 'admin2.proponents.store',
                    'edit' => 'admin2.proponents.edit',
                    'update' => 'admin2.proponents.update',
                    'destroy' => 'admin2.proponents.destroy',
                ])->parameters([
                    'proponents' => 'proponent'
                ]);
        });
    });

});

// Proponent Routes
Route::middleware(['auth', 'role:1'])->group(function () {
    // Proponent Dashboard
    Route::get('/proponent/dashboard', function() {
            try {
                return app()->make(\App\Http\Controllers\ProponentPAPController::class)->dashboard();
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }
        })
        ->name('proponent.dashboard');

    // PAP Routes
    Route::prefix('proponent/pap')->group(function () {
        Route::get('/create', [\App\Http\Controllers\ProponentPAPController::class, 'create'])
            ->name('proponent.pap.create');
        // Local DB debug (only in local env)
        if (app()->environment('local')) {
            Route::get('/db-debug', [\App\Http\Controllers\ProponentPAPController::class, 'dbDebug'])
                ->name('proponent.pap.db-debug');
        }
        Route::get('/submissions', [\App\Http\Controllers\ProponentPAPController::class, 'submissions'])
            ->name('proponent.pap.submissions');
        Route::get('/submissions/{project}', [\App\Http\Controllers\ProponentPAPController::class, 'submissionShow'])
            ->name('proponent.pap.submissions.show');
        // Draft endpoints
        Route::get('/draft', [\App\Http\Controllers\ProponentPAPController::class, 'getDraft'])
            ->name('proponent.pap.draft.get');
        Route::post('/draft', [\App\Http\Controllers\ProponentPAPController::class, 'saveDraft'])
            ->name('proponent.pap.draft.save');
        Route::post('/', [\App\Http\Controllers\ProponentPAPController::class, 'store'])
            ->name('proponent.pap.store');
        Route::post('/{project}/documents', [\App\Http\Controllers\ProponentPAPController::class, 'uploadDocuments'])
            ->name('proponent.pap.upload-documents');
        Route::get('/documents/{document}/download', [\App\Http\Controllers\ProponentPAPController::class, 'downloadDocument'])
            ->name('proponent.pap.document.download');

        Route::get('/{project}', [\App\Http\Controllers\ProponentPAPController::class, 'show'])
            ->name('proponent.pap.show');
    });

    // Certificate Routes
    Route::prefix('proponent/certificates')->name('proponent.certificates.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Proponent\CertificateController::class, 'index'])
            ->name('index');
        Route::get('/stats', [\App\Http\Controllers\Proponent\CertificateController::class, 'getStats'])
            ->name('stats');
        Route::get('/{certificate}/download', [\App\Http\Controllers\Proponent\CertificateController::class, 'download'])
            ->name('download');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/evaluator.php';
require __DIR__.'/admin2.php';
require __DIR__.'/proponent.php';
require __DIR__.'/api.php';  // API routes with /api prefix
