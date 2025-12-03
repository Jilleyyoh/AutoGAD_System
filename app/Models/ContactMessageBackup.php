<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactMessageBackup extends Model
{
    /** @use HasFactory<\Database\Factories\ContactMessageBackupFactory> */
    use HasFactory;
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contact_messages_backup';
    
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
}
