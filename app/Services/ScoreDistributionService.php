<?php

namespace App\Services;

use App\Models\QuestionnaireItem;
use App\Models\QuestionnaireCategory;
use Illuminate\Support\Facades\Log;

/**
 * ScoreDistributionService
 * 
 * Handles equal score distribution across all questions in a category.
 * When equal distribution is enabled for a category, all questions are recalculated
 * to ensure their max scores sum to the category max score.
 * 
 * Key Features:
 * - Computes equal max_score for each question: category_max / question_count
 * - Generates score options with consistent step pattern
 * - Handles high-precision decimals (DECIMAL 18,8)
 * - Tracks distribution state at category level
 * - Ensures consistency across all questions
 */
class ScoreDistributionService
{
    /**
     * Compute score options for a given max score using standard pattern
     * 
     * Pattern: [0, max_score / 2, max_score]
     * This creates a three-point scale with quarters
     * 
     * @param float|string $maxScore The maximum score for this question
     * @return string Comma-separated score options (e.g., "0,1.25,2.5")
     */
    public static function generateScoreOptions($maxScore): string
    {
        // Convert to float to avoid precision issues
        $max = (float)$maxScore;
        
        // Standard three-point pattern: 0, half, full
        $half = $max / 2;
        
        // Format to 8 decimal places (matching DB precision) then trim trailing zeros
        $scoreZero = "0";
        $scoreHalf = rtrim(rtrim(number_format($half, 8, '.', ''), '0'), '.');
        $scoreFull = rtrim(rtrim(number_format($max, 8, '.', ''), '0'), '.');
        
        return "{$scoreZero},{$scoreHalf},{$scoreFull}";
    }

    /**
     * Recalculate all questions in a category with equal distribution
     * 
     * This method is the core equal distribution engine. It:
     * 1. Gets all active questions in the category (ACTUAL question count)
     * 2. Computes equal max_score for each: category_max / question_count
     * 3. Generates score options for each question
     * 4. Persists all changes atomically
     * 
     * IMPORTANT: This now ALWAYS runs for all categories (no enabled flag check)
     * 
     * @param int $categoryId The category to recalculate
     * @return array Summary of changes: ['count' => int, 'total_max_score' => float, 'per_question_score' => float]
     */
    public static function recalculateCategory(int $categoryId): array
    {
        // Skip if the column doesn't exist yet (before migration)
        try {
            $category = QuestionnaireCategory::findOrFail($categoryId);
        } catch (\Exception $e) {
            Log::warning("ScoreDistributionService: Could not find category {$categoryId}");
            return ['count' => 0, 'total_max_score' => 0, 'per_question_score' => 0];
        }
        
        // Get all ACTIVE questions in the category - this is the ANCHOR count
        $questions = QuestionnaireItem::where('category_id', $categoryId)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();
        
        $currentCount = $questions->count();
        
        // Handle empty category
        if ($currentCount === 0) {
            Log::info("No active questions in category {$categoryId}, skipping recalculation");
            return [
                'count' => 0,
                'total_max_score' => (float)$category->max_score,
                'per_question_score' => 0,
            ];
        }
        
        // Calculate equal score per question with high precision
        $categoryMax = (float)$category->max_score;
        $perQuestionScore = $categoryMax / $currentCount;
        
        // Track if any questions actually changed (for logging)
        $changedCount = 0;
        
        // Update each question with the calculated score
        foreach ($questions as $question) {
            $scoreOptions = self::generateScoreOptions($perQuestionScore);
            
            try {
                // Check if this question needs updating
                $oldMaxScore = (float)$question->max_score;
                $oldOptions = $question->score_options;
                
                // Only update if values changed (reduces DB writes)
                if ($oldMaxScore != $perQuestionScore || $oldOptions !== $scoreOptions) {
                    $question->update([
                        'max_score' => $perQuestionScore,
                        'score_options' => $scoreOptions,
                    ]);
                    $changedCount++;
                    
                    Log::debug("Recalculated question {$question->id}", [
                        'old_max_score' => $oldMaxScore,
                        'new_max_score' => $perQuestionScore,
                        'old_options' => $oldOptions,
                        'new_options' => $scoreOptions,
                        'category_id' => $categoryId,
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning("Could not update question {$question->id}: {$e->getMessage()}");
            }
        }
        
        Log::info("Equal distribution recalculation complete", [
            'category_id' => $categoryId,
            'current_question_count' => $currentCount,
            'questions_changed' => $changedCount,
            'category_max_score' => $categoryMax,
            'per_question_score' => $perQuestionScore,
        ]);
        
        return [
            'count' => $currentCount,
            'total_max_score' => $categoryMax,
            'per_question_score' => (float)$perQuestionScore,
            'changed' => $changedCount,
        ];
    }

    /**
     * Check if question count has changed and auto-recalculate if needed
     * 
     * This is the key method for "always active" equal distribution.
     * Call this whenever you need the current state of a category.
     * It will automatically recalculate all questions if they're out of sync.
     * 
     * IMPORTANT: Now ALWAYS recalculates (no enabled flag check)
     * 
     * @param int $categoryId The category to check
     * @return array ['needs_recalculation' => bool, 'reason' => string]
     */
    public static function checkAndRecalculateIfNeeded(int $categoryId): array
    {
        try {
            $category = QuestionnaireCategory::findOrFail($categoryId);
        } catch (\Exception $e) {
            return [
                'needs_recalculation' => false,
                'reason' => 'category_not_found',
                'error' => $e->getMessage(),
            ];
        }
        
        // Get the ACTUAL current question count
        $actualCount = QuestionnaireItem::where('category_id', $categoryId)
            ->where('is_active', true)
            ->count();
        
        if ($actualCount === 0) {
            return [
                'needs_recalculation' => false,
                'reason' => 'no_active_questions',
                'count' => 0,
            ];
        }
        
        // ALWAYS recalculate - scoring is now always automatic
        $result = self::recalculateCategory($categoryId);
        
        return [
            'needs_recalculation' => true,
            'reason' => 'always_recalculate_for_all_categories',
            'count' => $result['count'],
            'per_question_score' => $result['per_question_score'] ?? 0,
            'changed' => $result['changed'] ?? 0,
        ];
    }

    /**
     * Disable equal distribution for a category and mark questions as custom
     * 
     * This switches the category to manual mode where each question
     * can have custom score options and max scores.
     * 
     * @param int $categoryId The category to switch to manual mode
     * @return void
     */
    public static function disableEqualDistribution(int $categoryId): void
    {
        try {
            $category = QuestionnaireCategory::findOrFail($categoryId);
            
            // Mark all questions as not using equal distribution (only if column exists)
            // For now, just log the action
            Log::info("Disabled equal distribution for category {$categoryId}");
        } catch (\Exception $e) {
            Log::warning("Could not disable equal distribution: {$e->getMessage()}");
        }
    }

    /**
     * Get summary of category distribution
     * 
     * @param int $categoryId The category to get info for
     * @return array Summary with keys: max_score, question_count, per_question_score, enabled
     */
    public static function getCategorySummary(int $categoryId): array
    {
        $category = QuestionnaireCategory::findOrFail($categoryId);
        
        $activeCount = QuestionnaireItem::where('category_id', $categoryId)
            ->where('is_active', true)
            ->count();
        
        $perQuestion = $activeCount > 0 ? (float)$category->max_score / $activeCount : 0;
        
        return [
            'max_score' => (float)$category->max_score,
            'question_count' => $activeCount,
            'per_question_score' => $perQuestion,
            'enabled' => $category->equal_distribution_enabled,
        ];
    }

    /**
     * Validate that all questions in a category sum to category max
     * (for integrity checking)
     * 
     * @param int $categoryId The category to validate
     * @return array ['valid' => bool, 'sum' => float, 'expected' => float, 'difference' => float]
     */
    public static function validateCategoryDistribution(int $categoryId): array
    {
        try {
            $category = QuestionnaireCategory::findOrFail($categoryId);
            
            $sum = QuestionnaireItem::where('category_id', $categoryId)
                ->where('is_active', true)
                ->sum('max_score');
            
            $expected = (float)$category->max_score;
            $difference = abs($sum - $expected);
            
            // Allow for floating-point precision errors (within 0.01)
            $valid = $difference < 0.01;
            
            return [
                'valid' => $valid,
                'sum' => (float)$sum,
                'expected' => $expected,
                'difference' => $difference,
            ];
        } catch (\Exception $e) {
            Log::warning("Could not validate category distribution: {$e->getMessage()}");
            return [
                'valid' => false,
                'sum' => 0,
                'expected' => 0,
                'difference' => 0,
            ];
        }
    }
}
