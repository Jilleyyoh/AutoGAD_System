<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;

/**
 * API Routes for Notifications
 *
 * Uses web middleware group which includes CSRF (but api/* is excluded)
 * Base path: /api/notifications
 */
Route::prefix('api/notifications')->middleware(['web'])->group(function () {
    /**
     * Get all notifications (paginated)
     * GET /api/notifications
     * Query params:
     *   - per_page: int (default: 15)
     *   - type: string (optional, filter by type)
     */
    Route::get('/', [NotificationController::class, 'index'])
        ->name('notifications.index');

    /**
     * Get unread notification count
     * GET /api/notifications/unread-count
     */
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])
        ->name('notifications.unread-count');

    /**
     * Get recent unread notifications (for bell icon)
     * GET /api/notifications/unread
     * Query params:
     *   - limit: int (default: 10)
     */
    Route::get('/unread', [NotificationController::class, 'unread'])
        ->name('notifications.unread');

    /**
     * Mark all notifications as read
     * PATCH /api/notifications/mark-all-read
     */
    Route::patch('/mark-all-read', [NotificationController::class, 'markAllAsRead'])
        ->withoutMiddleware(['Illuminate\Foundation\Http\Middleware\VerifyCsrfToken'])
        ->name('notifications.mark-all-read');

    /**
     * Clear all read notifications
     * DELETE /api/notifications/clear-read
     */
    Route::delete('/clear-read', [NotificationController::class, 'clearRead'])
        ->name('notifications.clear-read');

    /**
     * Get single notification
     * GET /api/notifications/{id}
     */
    Route::get('/{id}', [NotificationController::class, 'show'])
        ->name('notifications.show');

    /**
     * Mark single notification as read
     * PATCH /api/notifications/{id}/read
     */
    Route::patch('/{id}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.mark-as-read');

    /**
     * Delete single notification
     * DELETE /api/notifications/{id}
     */
    Route::delete('/{id}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');
});
