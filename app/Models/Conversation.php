<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    /** @use HasFactory<\Database\Factories\ConversationFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'proponent_id',
        'created_by',
        'subject',
    ];
    
    /**
     * Get the proponent associated with this conversation.
     */
    public function proponent(): BelongsTo
    {
        return $this->belongsTo(Proponent::class);
    }
    
    /**
     * Get the user who created this conversation.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    /**
     * Get the messages in this conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ContactMessage::class);
    }
}
