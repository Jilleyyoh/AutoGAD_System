<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectDocumentType extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectDocumentTypeFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['name'];
    
    /**
     * Get the project documents with this document type.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class, 'document_type_id');
    }
}
