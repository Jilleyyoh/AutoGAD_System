<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Evaluator\EvaluationController;
use App\Http\Controllers\Evaluator\NotificationsController;

Route::middleware(['auth', 'role:2'])->prefix('evaluator')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $evaluator = $user->evaluator;
        $domainExpertise = $evaluator->domainExpertise;
        
        // Get evaluation statistics
        $projects = $evaluator->projects()->with('projectStatus')->get();
        $pending = $projects->filter(function ($project) {
            return $project->projectStatus?->name === 'pending';
        })->count();
        $completed = $projects->filter(function ($project) {
            return $project->projectStatus?->name === 'completed';
        })->count();
        $total = $projects->count();
        
        return inertia('evaluator/dashboard', [
            'evaluator' => [
                'id' => $evaluator->id,
                'name' => $user->name,
                'email' => $user->email,
                'title' => $evaluator->evaluator_title ?? 'Evaluator',
                'domain_expertise' => $domainExpertise ? $domainExpertise->domain_name : 'Not specified',
            ],
            'stats' => [
                'pending' => $pending,
                'completed' => $completed,
                'total' => $total,
            ],
        ]);
    })->name('evaluator.dashboard');

    Route::prefix('evaluations')->group(function () {
        Route::get('/', [EvaluationController::class, 'index'])->name('evaluator.evaluations.index');
        Route::get('/{projectId}', [EvaluationController::class, 'show'])->name('evaluator.evaluations.show');
    Route::get('/certificate/{certificateId}/download', [EvaluationController::class, 'downloadCertificate'])->name('evaluator.evaluations.certificate.download');
        Route::get('/download/{documentId}', [EvaluationController::class, 'downloadDocument'])->name('evaluator.evaluations.download');
        Route::post('/{projectId}/save', [EvaluationController::class, 'saveScores'])->name('evaluator.evaluations.save');
        Route::post('/{projectId}/submit', [EvaluationController::class, 'submit'])->name('evaluator.evaluations.submit');
    });

    // Evaluator: Certificates (view certificates for projects they evaluated)
    Route::prefix('certificates')->name('evaluator.certificates.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Evaluator\CertificateController::class, 'index'])->name('index');
        Route::get('/{certificate}/download', [\App\Http\Controllers\Evaluator\CertificateController::class, 'download'])->name('download');
    });

    // Notifications Routes
    Route::prefix('notifications')->name('evaluator.notifications.')->group(function () {
        Route::get('/', [NotificationsController::class, 'index'])->name('index');
    });
});

