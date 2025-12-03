<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactMessage extends Model
{
    /** @use HasFactory<\Database\Factories\ContactMessageFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'proponent_id',
        'subject',
        'message',
        'status_id',
        'reply',
        'replied_by',
        'replied_at',
        'parent_message_id',
        'conversation_id',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'replied_at' => 'datetime',
    ];
    
    /**
     * Get the proponent who sent this message.
     */
    public function proponent(): BelongsTo
    {
        return $this->belongsTo(Proponent::class);
    }
    
    /**
     * Get the status of this message.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(ContactMessageStatus::class, 'status_id');
    }
    
    /**
     * Get the user who replied to this message.
     */
    public function repliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }
    
    /**
     * Get the parent message if this is a reply.
     */
    public function parentMessage(): BelongsTo
    {
        return $this->belongsTo(ContactMessage::class, 'parent_message_id');
    }
    
    /**
     * Get the replies to this message.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(ContactMessage::class, 'parent_message_id');
    }
    
    /**
     * Get the conversation this message belongs to.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
