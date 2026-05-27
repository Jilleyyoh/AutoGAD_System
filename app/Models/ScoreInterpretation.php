<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScoreInterpretation extends Model
{
    protected $fillable = ['score_min', 'score_max', 'interpretation', 'description', 'version'];

    /**
     * Type casting for numeric fields
     * Ensures score_min and score_max are always returned as floats, not strings
     */
    protected $casts = [
        'score_min' => 'float',
        'score_max' => 'float',
    ];
}
