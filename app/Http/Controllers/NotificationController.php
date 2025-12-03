<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use App\Http\Requests\StoreNotificationRequest;
use App\Http\Requests\UpdateNotificationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * NotificationController
 *
 * Handles API endpoints for notification management.
 * Endpoints for retrieving, marking as read, and deleting notifications.
 */
class NotificationController extends Controller
{
    /**
     * Get all notifications for authenticated user (paginated)
     *
     * GET /api/notifications
     * Query params:
     * - per_page: int (default: 15)
     * - type: string (optional, filter by notification type)
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 15);
            $type = $request->query('type');

            $query = Notification::forUser(auth()->id())
                ->orderBy('created_at', 'desc');

            if ($type) {
                $query->ofType($type);
            }

            $notifications = $query->paginate($perPage);

            return response()->json([
                'data' => $notifications->items(),
                'pagination' => [
                    'total' => $notifications->total(),
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching notifications', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error fetching notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single notification by ID
     *
     * GET /api/notifications/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            return response()->json([
                'data' => $notification,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching notification', [
                'notification_id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Notification not found',
            ], 404);
        }
    }

    /**
     * Get unread notification count for authenticated user
     *
     * GET /api/notifications/unread-count
     *
     * @return JsonResponse
     */
    public function unreadCount(): JsonResponse
    {
        try {
            $count = NotificationService::getUnreadCount(auth()->id());

            return response()->json([
                'count' => $count,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting unread count', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error getting unread count',
            ], 500);
        }
    }

    /**
     * Get recent unread notifications for bell icon
     *
     * GET /api/notifications/unread
     * Query params:
     * - limit: int (default: 10)
     *
     * @return JsonResponse
     */
    public function unread(Request $request): JsonResponse
    {
        try {
            $limit = $request->query('limit', 10);

            $notifications = NotificationService::getUserUnreadNotifications(
                auth()->id(),
                $limit
            );

            // Map notifications to include redirect_url
            $notificationsWithRedirect = $notifications->map(function ($notification) {
                return array_merge(
                    $notification->toArray(),
                    ['redirect_url' => $notification->getRedirectUrl()]
                );
            });

            return response()->json([
                'data' => $notificationsWithRedirect,
                'total' => count($notificationsWithRedirect),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching unread notifications', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error fetching unread notifications',
            ], 500);
        }
    }

    /**
     * Mark single notification as read
     *
     * PATCH /api/notifications/{id}/read
     *
     * @param int $id
     * @return JsonResponse
     */
    public function markAsRead(int $id): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $notification->markAsRead();

            return response()->json([
                'message' => 'Notification marked as read',
                'data' => $notification,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error marking notification as read', [
                'notification_id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error marking notification as read',
            ], 500);
        }
    }

    /**
     * Mark all notifications as read for authenticated user
     *
     * PATCH /api/notifications/mark-all-read
     *
     * @return JsonResponse
     */
    public function markAllAsRead(): JsonResponse
    {
        try {
            $success = NotificationService::markAllAsRead(auth()->id());

            if ($success) {
                return response()->json([
                    'message' => 'All notifications marked as read',
                ]);
            } else {
                return response()->json([
                    'message' => 'Error marking notifications as read',
                ], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Error marking all notifications as read', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error marking notifications as read',
            ], 500);
        }
    }

    /**
     * Delete single notification
     *
     * DELETE /api/notifications/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $notification->delete();

            return response()->json([
                'message' => 'Notification deleted',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting notification', [
                'notification_id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error deleting notification',
            ], 500);
        }
    }

    /**
     * Clear all read notifications for authenticated user
     *
     * DELETE /api/notifications/clear-read
     *
     * @return JsonResponse
     */
    public function clearRead(): JsonResponse
    {
        try {
            $deleted = NotificationService::deleteReadNotifications(auth()->id());

            return response()->json([
                'message' => 'Read notifications cleared',
                'deleted_count' => $deleted,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error clearing read notifications', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error clearing notifications',
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * (Not used - notifications are created by system, not users)
     */
    public function store(StoreNotificationRequest $request)
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     * (Not used - API endpoints only)
     */
    public function create()
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     * (Not used - notifications are read-only for users)
     */
    public function edit(Notification $notification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * (Not used - use markAsRead endpoint instead)
     */
    public function update(UpdateNotificationRequest $request, Notification $notification)
    {
        //
    }
}

