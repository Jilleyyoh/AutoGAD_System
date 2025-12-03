<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionnaireVersion extends Model
{
    protected $table = 'questionnaire_versions';

    protected $fillable = [
        'version_number',
        'description',
        'is_active',
        'status',
        'snapshot',
        'passing_score',
        'archived_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'passing_score' => 'decimal:2',
        'snapshot' => 'array',
        'archived_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all evaluations that used this questionnaire version
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'questionnaire_version_id');
    }

    /**
     * Get categories from snapshot
     */
    public function getCategories(): array
    {
        if (!$this->snapshot || !isset($this->snapshot['categories'])) {
            return [];
        }
        return $this->snapshot['categories'];
    }

    /**
     * Get questions from snapshot
     */
    public function getQuestions(): array
    {
        if (!$this->snapshot || !isset($this->snapshot['questions'])) {
            return [];
        }
        return $this->snapshot['questions'];
    }

    /**
     * Mark version as archived
     */
    public function archive(): void
    {
        $this->update([
            'status' => 'archived',
            'is_active' => false,
            'archived_at' => now(),
        ]);
    }

    /**
     * Check if this version is locked (has associated evaluations)
     */
    public function isLocked(): bool
    {
        return $this->evaluations()->exists();
    }

    /**
     * Get count of evaluations using this version
     */
    public function evaluationCount(): int
    {
        return $this->evaluations()->count();
    }
}
