<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization',
        'position',
        'contact_number'
    ];

    /**
     * Get the user that owns this proponent profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
