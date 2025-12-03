<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin2\EvaluationController;
use App\Http\Controllers\Admin2\CertificationController;
use App\Http\Controllers\Admin2\ProponentController;
use App\Http\Controllers\Admin2\NotificationsController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ContactMessageController;

Route::middleware(['auth', 'role:4'])->prefix('admin2')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        // Get evaluation statistics
        $readyForConsolidation = \App\Models\Project::whereHas('evaluations', function ($query) {
            $query->where('status_id', 3); // Approved evaluations (status id 3)
        })->count();
        
        $approvedForCertification = \App\Models\Project::whereHas('projectStatus', function ($query) {
            $query->where('name', 'for_certification');
        })->count();
        
        $allCompletedEvaluations = \App\Models\Evaluation::where('status_id', 3)->get();
        $avgConsolidatedScore = count($allCompletedEvaluations) > 0 
            ? $allCompletedEvaluations->avg('total_score')
            : null;
        
        return inertia('admin2/dashboard', [
            'admin' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'title' => 'Evaluation Manager',
            ],
            'stats' => [
                'ready_for_consolidation' => $readyForConsolidation,
                'approved_for_certification' => $approvedForCertification,
                'avg_consolidated_score' => $avgConsolidatedScore ? (float)$avgConsolidatedScore : null,
            ],
        ]);
    })->name('admin2.dashboard');

    // Version History
    Route::get('/versions', [EvaluationController::class, 'versionHistory'])->name('admin2.versions.index');

    Route::prefix('evaluations')->group(function () {
        Route::get('/', [EvaluationController::class, 'index'])->name('admin2.evaluations.index');
        Route::get('/{projectId}/review', [EvaluationController::class, 'review'])->name('admin2.evaluations.review');
        Route::post('/{projectId}/consolidate', [EvaluationController::class, 'consolidate'])->name('admin2.evaluations.consolidate');
    });

    Route::prefix('certifications')->group(function () {
        Route::get('/', [CertificationController::class, 'index'])->name('admin2.certifications.index');
        Route::get('/{projectId}/show', [CertificationController::class, 'show'])->name('admin2.certifications.show');
        Route::post('/{projectId}/generate', [CertificationController::class, 'generate'])->name('admin2.certifications.generate');
        Route::get('/{certificateId}/download', [CertificationController::class, 'download'])->name('admin2.certifications.download');
        Route::get('/documents/{documentId}/download', [CertificationController::class, 'downloadDocument'])->name('admin2.certifications.document-download');
    });

    Route::prefix('proponents')->name('admin2.proponents.')->group(function () {
        Route::get('/', [ProponentController::class, 'index'])->name('index');
        Route::get('/create', [ProponentController::class, 'create'])->name('create');
        Route::post('/', [ProponentController::class, 'store'])->name('store');
        Route::get('/{proponent}/edit', [ProponentController::class, 'edit'])->name('edit');
        Route::put('/{proponent}', [ProponentController::class, 'update'])->name('update');
        Route::delete('/{proponent}', [ProponentController::class, 'destroy'])->name('destroy');
    });

    // Conversation Routes (Messaging)
    Route::prefix('conversations')->name('admin2.conversations.')->group(function () {
        Route::get('/', [ConversationController::class, 'index'])->name('index');
        Route::get('/{conversation}', [ConversationController::class, 'show'])->name('show');
        Route::post('/{conversation}/messages', [ContactMessageController::class, 'store'])->name('messages.store');
    });

    // Notifications Routes
    Route::prefix('notifications')->name('admin2.notifications.')->group(function () {
        Route::get('/', [NotificationsController::class, 'index'])->name('index');
    });
});
