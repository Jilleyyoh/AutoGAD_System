<?php

namespace App\Services;

use App\Models\Evaluation;
use App\Models\QuestionnaireVersion;
use Illuminate\Support\Collection;

/**
 * EvaluationQuestionnaireTransformer
 * 
 * Transforms questionnaire version snapshot data into a format
 * suitable for the evaluation interface. Ensures that evaluators
 * always see the exact configuration from Admin 1 (as captured in
 * the questionnaire version snapshot).
 * 
 * This service is crucial for maintaining version integrity and
 * consistency between Admin 1's configuration and Evaluator's interface.
 */
class EvaluationQuestionnaireTransformer
{
    /**
     * Get formatted questionnaire categories for an evaluation
     * 
     * Retrieves the questionnaire structure from the specific version
     * that was assigned to the evaluation (not from live tables).
     * 
     * @param Evaluation $evaluation
     * @return array
     */
    public static function getCategories(Evaluation $evaluation): array
    {
        $version = $evaluation->questionnaireVersion;
        
        if (!$version) {
            return [];
        }

        // Get snapshot from the version
        $snapshot = $version->snapshot ?? [];
        $categories = $snapshot['categories'] ?? [];
        $questions = $snapshot['questions'] ?? [];
        $questionsById = collect($questions)->keyBy('id');

        // Transform categories with their items from snapshot
        return collect($categories)->map(function ($category) use ($evaluation, $questionsById, $questions) {
            // Get questions that belong to this category from snapshot
            $categoryQuestions = collect($questions)->filter(function ($q) use ($category) {
                return $q['category_id'] === $category['id'];
            })->sortBy('display_order');

            return [
                'id' => $category['id'],
                'name' => $category['category_name'],
                'description' => $category['description'] ?? null,
                'max_score' => (float)$category['max_score'],
                'items' => $categoryQuestions->map(function ($item) use ($evaluation) {
                    return self::transformItem($item, $evaluation);
                })->values()->toArray(),
            ];
        })->values()->toArray();
    }

    /**
     * Transform a single questionnaire item from snapshot
     * 
     * Maps snapshot data to frontend structure and retrieves
     * current evaluation scores.
     * 
     * @param array $item
     * @param Evaluation $evaluation
     * @return array
     */
    private static function transformItem(array $item, Evaluation $evaluation): array
    {
        // Get current score and remarks for this item from evaluation
        $score = $evaluation->scores()
            ->where('questionnaire_item_id', $item['id'])
            ->first();

        // Parse score options from snapshot
        $scoreOptions = self::parseScoreOptions($item['score_options'] ?? '');

        return [
            'id' => $item['id'],
            'number' => $item['item_number'],
            'question' => $item['question'],
            'score_options' => $scoreOptions, // Array of score values from Admin 1 config
            'max_score' => (float)$item['max_score'],
            // FIXED: Use explicit null check instead of truthy check
            // This preserves scores of 0, 0.5, etc. which are falsy but valid
            'current_score' => $score !== null && $score->score !== null ? (float)$score->score : null,
            'remarks' => $score?->remarks ?? '',
        ];
    }

    /**
     * Parse score options from comma-separated string
     * 
     * Admin 1 defines score options (e.g., "0,0.5,1" or "0,1,2")
     * This method converts that string to an array of floats.
     * 
     * @param string $scoreOptionsString
     * @return array
     */
    public static function parseScoreOptions(string $scoreOptionsString): array
    {
        if (empty($scoreOptionsString)) {
            return [];
        }

        return array_map('floatval', explode(',', $scoreOptionsString));
    }

    /**
     * Get score label for a given score value
     * 
     * Maps numeric score values to human-readable labels.
     * Uses standard mapping: 0 = No, 0.5 = Partly, 1 = Yes
     * (but can be extended for custom scoring schemes)
     * 
     * @param float $score
     * @return string
     */
    public static function getScoreLabel(float $score): string
    {
        // Standard scoring scheme
        $labels = [
            0 => 'No',
            0.5 => 'Partly',
            1 => 'Yes',
        ];

        return $labels[$score] ?? (string)$score;
    }

    /**
     * Get all score labels for a questionnaire version
     * 
     * Returns mapping of all possible score values to labels
     * for a specific version.
     * 
     * @param QuestionnaireVersion $version
     * @return array
     */
    public static function getVersionScoreLabels(QuestionnaireVersion $version): array
    {
        $snapshot = $version->snapshot ?? [];
        $questions = $snapshot['questions'] ?? [];

        // Collect all unique score options from the version
        $allScoreOptions = collect($questions)
            ->map(function ($q) {
                return self::parseScoreOptions($q['score_options'] ?? '');
            })
            ->flatten()
            ->unique()
            ->sort()
            ->toArray();

        // Map each score to its label
        $labels = [];
        foreach ($allScoreOptions as $score) {
            $labels[$score] = self::getScoreLabel($score);
        }

        return $labels;
    }

    /**
     * Validate that a selected score matches the questionnaire configuration
     * 
     * Ensures that the score submitted by the evaluator is one of the
     * allowed options defined by Admin 1 for that question.
     * 
     * @param Evaluation $evaluation
     * @param int $itemId
     * @param float $score
     * @return bool
     */
    public static function isValidScore(Evaluation $evaluation, int $itemId, float $score): bool
    {
        $version = $evaluation->questionnaireVersion;
        if (!$version) {
            return false;
        }

        $snapshot = $version->snapshot ?? [];
        $questions = $snapshot['questions'] ?? [];

        // Find the question in the snapshot
        $question = collect($questions)->firstWhere('id', $itemId);
        if (!$question) {
            return false;
        }

        // Check if the score is in the allowed options with tolerance for floating-point precision
        $allowedScores = self::parseScoreOptions($question['score_options'] ?? '');
        
        // First try exact match for clean values
        if (in_array($score, $allowedScores, true)) {
            return true;
        }
        
        // Then try tolerant comparison for precision issues (like Category 2)
        foreach ($allowedScores as $allowedScore) {
            // Round both scores to database precision (2 decimal places) for comparison
            $roundedSubmitted = round($score * 100) / 100;
            $roundedAllowed = round($allowedScore * 100) / 100;
            
            if (abs($roundedSubmitted - $roundedAllowed) < 0.01) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get maximum score from questionnaire version snapshot
     * 
     * Extracts the total maximum possible score from the bound
     * questionnaire version snapshot. This ensures version accuracy
     * and prevents drift when Admin 1 changes live categories.
     * 
     * @param Evaluation $evaluation
     * @return float
     */
    public static function getMaxScoreFromSnapshot(Evaluation $evaluation): float
    {
        $version = $evaluation->questionnaireVersion;
        
        if (!$version) {
            return 0.0;
        }

        $snapshot = $version->snapshot ?? [];
        
        // First, try to use pre-calculated total if available
        if (isset($snapshot['total_max_score']) && $snapshot['total_max_score'] > 0) {
            return (float)$snapshot['total_max_score'];
        }

        // Otherwise, sum category max_score values from snapshot
        $categories = $snapshot['categories'] ?? [];
        $maxScore = 0.0;
        
        foreach ($categories as $category) {
            if (isset($category['max_score'])) {
                $maxScore += (float)$category['max_score'];
            }
        }

        return $maxScore;
    }

    /**
     * Get version integrity info for logging/audit
     * 
     * Returns metadata about the questionnaire version used
     * for an evaluation.
     * 
     * @param Evaluation $evaluation
     * @return array
     */
    public static function getVersionIntegrityInfo(Evaluation $evaluation): array
    {
        $version = $evaluation->questionnaireVersion;

        if (!$version) {
            return [
                'version_id' => null,
                'version_number' => 'Unknown',
                'status' => 'Missing',
                'snapshot_integrity' => false,
            ];
        }

        $snapshot = $version->snapshot ?? [];

        return [
            'version_id' => $version->id,
            'version_number' => $version->version_number,
            'created_at' => $version->created_at->format('Y-m-d H:i:s'),
            'status' => $version->status,
            'categories_count' => count($snapshot['categories'] ?? []),
            'questions_count' => count($snapshot['questions'] ?? []),
            'total_max_score' => $snapshot['total_max_score'] ?? 0,
            'snapshot_integrity' => !empty($snapshot),
            'evaluation_locked' => true,
        ];
    }
}
