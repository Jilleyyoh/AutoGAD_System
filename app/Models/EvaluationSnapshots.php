<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationSnapshots extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationSnapshotsFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'evaluation_id',
        'questionnaire_structure',
        'evaluation_scores',
        'project_details',
    ];
    
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'questionnaire_structure' => 'array',
        'evaluation_scores' => 'array',
        'project_details' => 'array',
        'created_at' => 'datetime',
    ];
    
    /**
     * Get the evaluation associated with this snapshot.
     */
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }
}
