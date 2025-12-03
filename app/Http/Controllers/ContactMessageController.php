<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\Conversation;
use App\Http\Requests\StoreContactMessageRequest;
use App\Http\Requests\UpdateContactMessageRequest;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class ContactMessageController extends Controller
{
    /**
     * Store a new message or reply in a conversation
     */
    public function store(StoreContactMessageRequest $request, $conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify authorization
        if ($user->role_id === 1) {
            // Proponent can only message in their own conversation
            $proponent = $user->proponent;
            if (!$proponent || $conversation->proponent_id !== $proponent->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $proponentId = $proponent->id;
        } elseif ($user->role_id === 4) {
            // Admin2 can reply in any conversation
            $proponentId = $conversation->proponent_id;
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $message = ContactMessage::create([
                'conversation_id' => $conversationId,
                'proponent_id' => $proponentId,
                'subject' => $request->input('subject') ?? $conversation->subject ?? 'RE: Message',
                'message' => $request->input('message'),
                'status_id' => 1, // unread
                'replied_by' => $user->role_id === 4 ? $user->id : null,
                'replied_at' => $user->role_id === 4 ? now() : null,
            ]);

            // Reload with relations for response
            $message->load('repliedBy');

            // Send notifications based on sender role
            $conversation->load('proponent.user');
            if ($user->role_id === 4) {
                // Admin2 replying to proponent - notify proponent of reply
                NotificationService::notifyProponentMessageReply($conversation);
            } elseif ($user->role_id === 1) {
                // Proponent messaging admin2 - notify admin2 of message
                NotificationService::notifyAdmin2MessageReceived($conversation);
            }

            return response()->json([
                'message' => 'Message sent successfully',
                'data' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'subject' => $message->subject,
                    'created_at' => $message->created_at->toDateTimeString(),
                    'replied_by' => $message->repliedBy?->name,
                    'status_id' => $message->status_id,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating message', [
                'user_id' => $user->id,
                'conversation_id' => $conversationId,
                'message' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Error sending message'], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ContactMessage $contactMessage)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ContactMessage $contactMessage)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContactMessageRequest $request, ContactMessage $contactMessage)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ContactMessage $contactMessage)
    {
        //
    }
}
