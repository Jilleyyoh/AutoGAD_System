<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Evaluation extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'project_id',
        'evaluator_id',
        'questionnaire_version_id',
        'total_score',
        'interpretation_id',
        'status_id',
        'submission_date',
        'completion_date',
        'consolidated_at',
        'comments',
        'final_remarks',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_score' => 'decimal:2',
        'submission_date' => 'datetime',
        'completion_date' => 'datetime',
        'consolidated_at' => 'datetime',
    ];
    
    /**
     * Get the project being evaluated.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the questionnaire version used for this evaluation.
     */
    public function questionnaireVersion(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireVersion::class, 'questionnaire_version_id');
    }
    
    /**
     * Get the evaluator who performed this evaluation.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(Evaluator::class);
    }
    
    /**
     * Get the score interpretation for this evaluation.
     */
    public function interpretation(): BelongsTo
    {
        return $this->belongsTo(ScoreInterpretation::class, 'interpretation_id');
    }
    
    /**
     * Get the status of this evaluation.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(EvaluationStatus::class, 'status_id');
    }
    
    /**
     * Get the scores for this evaluation.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class);
    }
    
    /**
     * Get the snapshot of this evaluation.
     */
    public function snapshot(): HasOne
    {
        return $this->hasOne(EvaluationSnapshots::class);
    }

    /**
     * Get the category-level subtotals for this evaluation.
     * 
     * These are pre-calculated scores aggregated per questionnaire category,
     * allowing for efficient category-level reporting and analysis.
     */
    public function subtotals(): HasMany
    {
        return $this->hasMany(EvaluationSubtotal::class);
    }

    /**
     * Check if evaluation is locked to a specific version
     * (i.e., project cannot be edited, version is immutable)
     */
    public function isVersionLocked(): bool
    {
        return $this->project && \App\Services\EvaluationVersionManagementService::isEvaluationLocked($this->project);
    }

    /**
     * Check if evaluation is in a reevaluation state
     * (project sent back for revision/correction)
     */
    public function isForReevaluation(): bool
    {
        return $this->project && \App\Services\EvaluationVersionManagementService::isProjectForReevaluation($this->project);
    }

    /**
     * Get version locking status information
     */
    public function getVersionLockingStatus(): array
    {
        return \App\Services\EvaluationVersionManagementService::getVersionLockingStatus($this->project);
    }
}
