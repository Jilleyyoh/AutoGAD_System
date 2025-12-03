<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ContactMessage;
use App\Models\Proponent;
use App\Services\NotificationService;
use App\Http\Requests\StoreConversationRequest;
use App\Http\Requests\UpdateConversationRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConversationController extends Controller
{
    /**
     * Display a listing of conversations for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        
        if ($user->role_id === 1) {
            // Proponent: Get conversations for their proponent_id
            $proponent = $user->proponent;
            if (!$proponent) {
                abort(403, 'Proponent profile not found');
            }

            $conversations = Conversation::where('proponent_id', $proponent->id)
                ->with(['creator', 'messages' => function ($query) {
                    $query->latest()->limit(1);
                }])
                ->latest()
                ->paginate(15);

            return Inertia::render('proponent/conversations/index', [
                'conversations' => $conversations,
            ]);
        } elseif ($user->role_id === 4) {
            // Admin2: Get all conversations with unread counts
            $conversations = Conversation::with(['proponent.user', 'creator', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
                ->latest()
                ->paginate(15);

            return Inertia::render('admin2/conversations/index', [
                'conversations' => $conversations,
            ]);
        }

        abort(403, 'Unauthorized');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created conversation
     */
    public function store(StoreConversationRequest $request)
    {
        $user = Auth::user();

        // Validate authorization
        if ($user->role_id === 1) {
            $proponent = $user->proponent;
            if (!$proponent) {
                return response()->json(['message' => 'Proponent profile not found'], 403);
            }
            $proponentId = $proponent->id;
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $conversation = Conversation::create([
                'proponent_id' => $proponentId,
                'created_by' => $user->id,
                'subject' => $request->input('subject'),
            ]);

            // Create initial message
            ContactMessage::create([
                'conversation_id' => $conversation->id,
                'proponent_id' => $proponentId,
                'subject' => $request->input('subject'),
                'message' => $request->input('message'),
                'status_id' => 1, // unread
            ]);

            // Send notification to Admin2
            $conversation->load('proponent.user');
            NotificationService::notifyAdmin2MessageReceived($conversation);

            return response()->json([
                'message' => 'Conversation created successfully',
                'conversation_id' => $conversation->id,
                'redirect' => route('proponent.conversations.show', $conversation->id),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating conversation', [
                'user_id' => $user->id,
                'message' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Error creating conversation'], 500);
        }
    }

    /**
     * Display a specific conversation
     */
    public function show(Conversation $conversation)
    {
        $user = Auth::user();

        // Verify authorization
        if ($user->role_id === 1) {
            // Proponent can only view their own conversations
            $proponent = $user->proponent;
            if (!$proponent || $conversation->proponent_id !== $proponent->id) {
                abort(403, 'Unauthorized');
            }
        } elseif ($user->role_id === 4) {
            // Admin2 can view any conversation
        } else {
            abort(403, 'Unauthorized');
        }

        $conversation->load([
            'proponent.user',
            'creator',
            'messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
            'messages.repliedBy'
        ]);

        // Mark all messages as read for the viewer
        $conversation->messages()->where('status_id', 1)->update(['status_id' => 2]);

        if ($user->role_id === 1) {
            return Inertia::render('proponent/conversations/show', [
                'conversation' => $conversation,
                'userRole' => 'proponent',
            ]);
        } else {
            return Inertia::render('admin2/conversations/show', [
                'conversation' => $conversation,
                'userRole' => 'admin2',
            ]);
        }
    }

    /**
     * Get conversation as JSON API response
     */
    public function apiShow(Conversation $conversation)
    {
        $user = Auth::user();

        // Verify authorization
        if ($user->role_id === 1) {
            $proponent = $user->proponent;
            if (!$proponent || $conversation->proponent_id !== $proponent->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif ($user->role_id === 4) {
            // Admin2 can view any conversation
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->load([
            'proponent.user',
            'creator',
            'messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
            'messages.repliedBy'
        ]);

        // Mark all messages as read for the viewer
        $conversation->messages()->where('status_id', 1)->update(['status_id' => 2]);

        return response()->json($conversation);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Conversation $conversation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateConversationRequest $request, Conversation $conversation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Conversation $conversation)
    {
        //
    }
}
