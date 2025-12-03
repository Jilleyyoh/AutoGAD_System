<?php

namespace App\Http\Controllers;

use App\Models\ScoreInterpretation;
use App\Models\QuestionnaireSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ScoreInterpretationController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'score_min' => 'required|numeric|min:0|max:999.99',
            'score_max' => 'required|numeric|min:0|max:999.99|gt:score_min',
            'interpretation' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        // Check for overlapping score ranges
        $overlapping = ScoreInterpretation::where(function ($query) use ($request) {
            $query->whereBetween('score_min', [$request->score_min, $request->score_max])
                  ->orWhereBetween('score_max', [$request->score_min, $request->score_max])
                  ->orWhere(function ($subQuery) use ($request) {
                      $subQuery->where('score_min', '<=', $request->score_min)
                               ->where('score_max', '>=', $request->score_max);
                  });
        })->exists();

        if ($overlapping) {
            return redirect()->route('questionnaire.index')
                ->with('error', 'Score range overlaps with existing interpretation. Please check the ranges.');
        }

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');

        ScoreInterpretation::create([
            'score_min' => $request->score_min,
            'score_max' => $request->score_max,
            'interpretation' => $request->interpretation,
            'description' => $request->description,
            'version' => $currentVersion,
        ]);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Score interpretation created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ScoreInterpretation $scoreInterpretation)
    {
        $request->validate([
            'score_min' => 'required|numeric|min:0|max:999.99',
            'score_max' => 'required|numeric|min:0|max:999.99|gt:score_min',
            'interpretation' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        // Check for overlapping score ranges (excluding current record)
        $overlapping = ScoreInterpretation::where('id', '!=', $scoreInterpretation->id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('score_min', [$request->score_min, $request->score_max])
                      ->orWhereBetween('score_max', [$request->score_min, $request->score_max])
                      ->orWhere(function ($subQuery) use ($request) {
                          $subQuery->where('score_min', '<=', $request->score_min)
                                   ->where('score_max', '>=', $request->score_max);
                      });
            })->exists();

        if ($overlapping) {
            return redirect()->route('questionnaire.index')
                ->with('error', 'Score range overlaps with existing interpretation. Please check the ranges.');
        }

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');

        $scoreInterpretation->update([
            'score_min' => $request->score_min,
            'score_max' => $request->score_max,
            'interpretation' => $request->interpretation,
            'description' => $request->description,
            'version' => $currentVersion,
        ]);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Score interpretation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ScoreInterpretation $scoreInterpretation)
    {
        $scoreInterpretation->delete();

        return redirect()->route('questionnaire.index')
            ->with('success', 'Score interpretation deleted successfully.');
    }
}
