<?php

use App\Http\Controllers\ProponentPAPController;
use App\Http\Controllers\Proponent\CertificateController;
use App\Http\Controllers\Proponent\NotificationsController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ContactMessageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:1'])->group(function () {
    // Proponent Dashboard
    Route::get('/proponent/dashboard', [ProponentPAPController::class, 'dashboard'])
        ->name('proponent.dashboard');

    // PAP Routes
    Route::prefix('proponent/pap')->group(function () {
        Route::get('/create', [ProponentPAPController::class, 'create'])
            ->name('proponent.pap.create');
        Route::post('/', [ProponentPAPController::class, 'store'])
            ->name('proponent.pap.store');
        // More specific routes MUST come before generic {project} route
        Route::get('/{project}/revise', [ProponentPAPController::class, 'reviseShow'])
            ->name('proponent.pap.revise.show');
        Route::post('/{project}/revise', [ProponentPAPController::class, 'revise'])
            ->name('proponent.pap.revise');
        Route::get('/{project}', [ProponentPAPController::class, 'show'])
            ->name('proponent.pap.show');
    });

    // Certificates Routes
    Route::prefix('proponent/certificates')->group(function () {
        Route::get('/', [CertificateController::class, 'index'])
            ->name('proponent.certificates.index');
        Route::get('/{certificate}/download', [CertificateController::class, 'download'])
            ->name('proponent.certificates.download');
    });

    // Notifications Routes
    Route::prefix('proponent/notifications')->name('proponent.notifications.')->group(function () {
        Route::get('/', [NotificationsController::class, 'index'])->name('index');
    });

    // Conversation Routes (Messaging)
    Route::prefix('proponent/conversations')->name('proponent.conversations.')->group(function () {
        Route::get('/', [ConversationController::class, 'index'])->name('index');
        Route::post('/', [ConversationController::class, 'store'])->name('store');
        Route::get('/{conversation}', [ConversationController::class, 'show'])->name('show');
        Route::get('/{conversation}/api', [ConversationController::class, 'apiShow'])->name('api.show');
        Route::post('/{conversation}/messages', [ContactMessageController::class, 'store'])->name('messages.store');
    });
});