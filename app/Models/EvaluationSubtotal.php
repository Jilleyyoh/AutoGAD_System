<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * EvaluationSubtotal Model
 * 
 * Represents category-level score aggregations for evaluations.
 * Stores pre-calculated subtotals to:
 * - Improve query performance for reports
 * - Maintain historical scoring data
 * - Provide audit trail for category scores
 * 
 * Relationship: Each evaluation has many subtotals (one per category)
 */
class EvaluationSubtotal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'evaluation_id',
        'questionnaire_category_id',
        'category_name',
        'category_description',
        'max_score',
        'actual_score',
        'question_count',
        'score_percentage',
    ];

    protected $casts = [
        'max_score' => 'decimal:2',
        'actual_score' => 'decimal:2',
        'score_percentage' => 'decimal:2',
        'question_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relationship: Evaluation
     * 
     * Each subtotal belongs to one evaluation
     */
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }

    /**
     * Get the percentage score as a formatted string
     * 
     * @return string
     */
    public function getScorePercentageFormatted(): string
    {
        if ($this->score_percentage === null) {
            return '0%';
        }
        return round($this->score_percentage, 2) . '%';
    }

    /**
     * Check if category passed (above 50%)
     * 
     * @return bool
     */
    public function isPassed(): bool
    {
        return $this->score_percentage >= 50;
    }

    /**
     * Get score status label
     * 
     * @return string
     */
    public function getStatusLabel(): string
    {
        if ($this->actual_score === null) {
            return 'Not Scored';
        }

        $percentage = $this->score_percentage ?? 0;
        
        if ($percentage >= 80) {
            return 'Excellent';
        } elseif ($percentage >= 60) {
            return 'Good';
        } elseif ($percentage >= 40) {
            return 'Fair';
        } else {
            return 'Poor';
        }
    }

    /**
     * Scope: Get subtotals for a specific evaluation
     */
    public function scopeForEvaluation($query, int $evaluationId)
    {
        return $query->where('evaluation_id', $evaluationId);
    }

    /**
     * Scope: Get subtotals where actual score is above threshold
     */
    public function scopeAboveScore($query, float $threshold)
    {
        return $query->where('actual_score', '>=', $threshold);
    }

    /**
     * Scope: Get subtotals ordered by score
     */
    public function scopeOrderByScore($query, string $direction = 'desc')
    {
        return $query->orderBy('actual_score', $direction);
    }
}
