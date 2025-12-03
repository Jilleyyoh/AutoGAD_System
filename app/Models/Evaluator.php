<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluator extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'domain_expertise_id'];
    
    // Add proper casting
    protected $casts = [
        'user_id' => 'integer',
        'domain_expertise_id' => 'integer',
    ];

    /**
     * Get the user that owns this evaluator profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the domain expertise associated with this evaluator.
     */
    public function domainExpertise(): BelongsTo
    {
        return $this->belongsTo(DomainExpertise::class, 'domain_expertise_id');
    }

    /**
     * Get all projects assigned to this evaluator.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
