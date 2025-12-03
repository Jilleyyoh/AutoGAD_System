<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationScore extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationScoreFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'evaluation_id',
        'questionnaire_item_id',
        'score',
        'remarks',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'decimal:2',
    ];
    
    /**
     * Get the evaluation that owns this score.
     */
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }
    
    /**
     * Get the questionnaire item being scored.
     */
    public function questionnaireItem(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireItem::class);
    }
}
