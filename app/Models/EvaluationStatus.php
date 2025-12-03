<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationStatus extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['name'];
    
    /**
     * Get the evaluations with this status.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'status_id');
    }
}
