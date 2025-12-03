<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionnaireItem extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionnaireItemFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'category_id',
        'item_number',
        'question',
        'score_options',
        'max_score',
        'display_order',
        'is_active',
        'version',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'max_score' => 'decimal:8',  // Changed from decimal:2 to decimal:8 for high-precision support
        'is_active' => 'boolean',
    ];
    
    /**
     * Get the category that this item belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireCategory::class, 'category_id');
    }
    
    /**
     * Get the evaluation scores for this questionnaire item.
     */
    public function evaluationScores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class, 'questionnaire_item_id');
    }
    
    /**
     * Get score options as array.
     *
     * @return array<float>
     */
    public function getScoreOptionsArray(): array
    {
        return array_map('floatval', explode(',', $this->score_options));
    }
}
