<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'project_code',
        'project_title',
        'project_description',
        'rationale',
        'objectives',
        'implementation_phase_id',
        'proponent_id',
        'domain_expertise_id',
        'project_status_id',
        'evaluator_id',
        'approved_by',
        'total_score',
        'consolidated_score',
        'remarks',
        'for_revision_remarks',
        'admin2_remarks'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_score' => 'decimal:2',
            'consolidated_score' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
    
    /**
     * Get the implementation phase associated with the project.
     */
    public function implementationPhase(): BelongsTo
    {
        return $this->belongsTo(ImplementationPhase::class, 'implementation_phase_id');
    }
    
    /**
     * Get the proponent associated with the project.
     */
    public function proponent(): BelongsTo
    {
        return $this->belongsTo(Proponent::class);
    }
    
    /**
     * Get the domain expertise associated with the project.
     */
    public function domainExpertise(): BelongsTo
    {
        return $this->belongsTo(DomainExpertise::class);
    }
    
    /**
     * Get the project status associated with the project.
     */
    public function projectStatus(): BelongsTo
    {
        return $this->belongsTo(ProjectStatus::class, 'project_status_id');
    }

    /*
     * Backward compatibility accessors (if any blade/inertia still refers to old names)
     */
    public function getTitleAttribute(): ?string
    {
        return $this->project_title;
    }
    public function getDescriptionAttribute(): ?string
    {
        return $this->project_description;
    }
    public function getStatusIdAttribute(): ?int
    {
        return $this->project_status_id;
    }
    
    /**
     * Get the evaluator associated with the project.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(Evaluator::class);
    }
    
    /**
     * Get the user who approved the project.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    
    /**
     * Get the project documents associated with the project.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }
    
    /**
     * Get the evaluations associated with the project.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
    
    /**
     * Get the certificates associated with the project.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Get the primary certificate for this project (most recent).
     */
    public function certificate()
    {
        return $this->hasOne(Certificate::class)->latest();
    }
}
