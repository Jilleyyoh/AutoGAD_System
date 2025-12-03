<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScoreInterpretation extends Model
{
    protected $fillable = ['score_min', 'score_max', 'interpretation', 'description', 'version'];
}
