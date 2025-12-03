<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactMessageStatus extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['name'];

    /**
     * Get the messages with this status.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ContactMessage::class, 'status_id');
    }
    
    /**
     * Get the backup messages with this status.
     */
    public function backupMessages(): HasMany
    {
        return $this->hasMany(ContactMessageBackup::class, 'status_id');
    }
}
