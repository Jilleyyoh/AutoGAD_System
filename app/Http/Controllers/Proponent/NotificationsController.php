<?php

namespace App\Http\Controllers\Proponent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    /**
     * Show all notifications for the authenticated proponent
     */
    public function index()
    {
        $notifications = Notification::forUser(auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($notification) {
                $redirectUrl = $notification->getRedirectUrl();
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'is_read' => $notification->isRead(),
                    'redirect_url' => $redirectUrl,
                    'created_at' => $notification->created_at->toIso8601String(),
                    'created_at_human' => $notification->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('proponent/notifications', [
            'notifications' => $notifications,
        ]);
    }
}

