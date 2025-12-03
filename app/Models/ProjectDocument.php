<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDocument extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectDocumentFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'project_id',
        'document_type_id',
        'file_path',
        'file_name',
        'drive_link',
        'description',
        'upload_date',
        'file_content',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'upload_date' => 'datetime',
    ];
    
    /**
     * Get the project that owns the document.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
    
    /**
     * Get the document type of this document.
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(ProjectDocumentType::class, 'document_type_id');
    }
}
