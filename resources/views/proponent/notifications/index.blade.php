@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
    </div>

    @if($notifications->count() > 0)
        <div class="space-y-3">
            @foreach($notifications as $notification)
                <div class="p-4 rounded-lg border {{ $notification->isRead() ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' }}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="font-semibold text-gray-900 dark:text-white">{{ $notification->title }}</h3>
                                @if($notification->isUnread())
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        Unread
                                    </span>
                                @endif
                            </div>
                            <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">{{ $notification->message }}</p>
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ $notification->created_at->diffForHumans() }}
                                </span>
                                @php
                                    $redirectUrl = null;
                                    try {
                                        $redirectUrl = $notification->getRedirectUrl();
                                    } catch (\Exception $e) {
                                        // Silently catch errors to prevent page crashes
                                    }
                                @endphp
                                @if($redirectUrl)
                                    <a href="{{ $redirectUrl }}" class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        View Details →
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Pagination -->
        @if($notifications->hasPages())
            <div class="mt-6">
                {{ $notifications->links() }}
            </div>
        @endif
    @else
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="mt-4 text-gray-500 dark:text-gray-400">No notifications yet</p>
        </div>
    @endif
</div>
@endsection
