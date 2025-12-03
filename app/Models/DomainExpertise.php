<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DomainExpertise extends Model
{
    use HasFactory;

    protected $fillable = ['domain_name', 'description'];
    
    // Add this to ensure proper casting
    protected $casts = [
        'id' => 'integer',
    ];

    /**
     * Get the evaluators associated with this domain expertise.
     */
    public function evaluators(): HasMany
    {
        return $this->hasMany(Evaluator::class);
    }
}
