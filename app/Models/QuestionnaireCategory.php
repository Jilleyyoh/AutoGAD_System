<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionnaireCategory extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionnaireCategoryFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'category_name',
        'description',
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
     * Get the questionnaire items in this category.
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuestionnaireItem::class, 'category_id');
    }
}
