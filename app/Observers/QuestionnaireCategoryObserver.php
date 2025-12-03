<?php

namespace App\Observers;

use App\Models\QuestionnaireCategory;
use Illuminate\Support\Facades\Log;

/**
 * QuestionnaireCategoryObserver
 * 
 * Automatically handles equal score distribution recalculation
 * whenever category data is retrieved or updated.
 * 
 * This ensures equal distribution is ALWAYS ACTIVE and UP-TO-DATE
 * without any manual triggers needed.
 */
class QuestionnaireCategoryObserver
{
    /**
     * Handle the QuestionnaireCategory "retrieved" event.
     * 
     * Called every time a category is loaded from the database.
     * Automatically recalculates distribution since scoring is now always active.
     * 
     * @param QuestionnaireCategory $category
     * @return void
     */
    public function retrieved(QuestionnaireCategory $category): void
    {
        try {
            // Get actual question count
            $activeCount = $category->items()
                ->where('is_active', true)
                ->count();

            if ($activeCount === 0) {
                return; // Nothing to distribute
            }

            // Calculate what the score should be
            $categoryMax = (float) $category->max_score;
            $expectedScorePerQuestion = $categoryMax / $activeCount;

            // Check if any question has wrong score
            $needsRecalculation = $category->items()
                ->where('is_active', true)
                ->get()
                ->some(function ($item) use ($expectedScorePerQuestion) {
                    return abs((float)$item->max_score - round($expectedScorePerQuestion, 8)) > 0.0001;
                });

            // If recalculation needed, do it
            if ($needsRecalculation) {
                $this->recalculateDistribution($category, $activeCount, $expectedScorePerQuestion);
            }
        } catch (\Exception $e) {
            Log::warning('Error in CategoryObserver retrieved', [
                'category_id' => $category->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle the QuestionnaireCategory "updated" event.
     * 
     * When a category is updated (e.g., max_score changes),
     * recalculate all its distributions since scoring is now always active.
     * 
     * @param QuestionnaireCategory $category
     * @return void
     */
    public function updated(QuestionnaireCategory $category): void
    {
        try {
            $activeCount = $category->items()
                ->where('is_active', true)
                ->count();

            if ($activeCount > 0) {
                $categoryMax = (float) $category->max_score;
                $scorePerQuestion = $categoryMax / $activeCount;
                $this->recalculateDistribution($category, $activeCount, $scorePerQuestion);
            }
        } catch (\Exception $e) {
            Log::warning('Error in CategoryObserver updated', [
                'category_id' => $category->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Recalculate distribution for the category
     * 
     * @param QuestionnaireCategory $category
     * @param int $questionCount
     * @param float $scorePerQuestion
     * @return void
     */
    private function recalculateDistribution(QuestionnaireCategory $category, int $questionCount, float $scorePerQuestion): void
    {
        try {
            $halfScore = $scorePerQuestion / 2;
            $scoreOptions = "0," . round($halfScore, 8) . "," . round($scorePerQuestion, 8);
            $roundedScore = round($scorePerQuestion, 8);

            // Update all active questions
            $updated = $category->items()
                ->where('is_active', true)
                ->update([
                    'max_score' => $roundedScore,
                    'score_options' => $scoreOptions,
                ]);

            if ($updated > 0) {
                Log::info('Auto-recalculated via Observer', [
                    'category_id' => $category->id,
                    'category_name' => $category->category_name,
                    'questions_updated' => $updated,
                    'score_per_question' => $roundedScore,
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Error in recalculateDistribution', [
                'category_id' => $category->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
