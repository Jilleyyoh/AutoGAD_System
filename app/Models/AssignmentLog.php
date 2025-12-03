<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentLog extends Model
{
    /** @use HasFactory<\Database\Factories\AssignmentLogFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'project_id',
        'evaluator_id',
        'assigned_by',
        'assignment_date',
        'status_id',
        'notes',
    ];
    
    /**
     * Indicates if the model uses timestamps.
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
        'assignment_date' => 'datetime',
        'created_at' => 'datetime',
    ];
    
    /**
     * Get the project associated with this assignment.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
    
    /**
     * Get the evaluator assigned in this log.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(Evaluator::class);
    }
    
    /**
     * Get the user who made this assignment.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
    
    /**
     * Get the status of this assignment.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(AssignmentStatus::class, 'status_id');
    }
}
