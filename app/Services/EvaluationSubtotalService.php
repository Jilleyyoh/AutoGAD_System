<?php

namespace App\Services;

use App\Models\Evaluation;
use App\Models\EvaluationSubtotal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * EvaluationSubtotalService
 * 
 * Handles calculation and storage of category-level subtotals for evaluations.
 * 
 * Responsibilities:
 * - Calculate subtotal scores per category
 * - Store subtotals in dedicated table
 * - Update subtotals when scores change
 * - Provide efficient access to category scores
 * - Maintain audit trail of subtotal changes
 */
class EvaluationSubtotalService
{
    /**
     * Calculate and store subtotals for an evaluation
     * 
     * This method:
     * 1. Retrieves all questions from the evaluation's questionnaire version
     * 2. Groups questions by category
     * 3. Sums scores for each category
     * 4. Stores subtotals in evaluation_subtotals table
     * 
     * @param Evaluation $evaluation
     * @return array Result with success status and details
     */
    public static function calculateAndStore(Evaluation $evaluation): array
    {
        try {
            $version = $evaluation->questionnaireVersion;
            
            if (!$version) {
                return [
                    'success' => false,
                    'message' => 'No questionnaire version found for evaluation',
                ];
            }

            $snapshot = $version->snapshot ?? [];
            $questions = $snapshot['questions'] ?? [];
            $categories = $snapshot['categories'] ?? [];

            if (empty($categories)) {
                return [
                    'success' => false,
                    'message' => 'No categories found in questionnaire snapshot',
                ];
            }

            $subtotalsCreated = 0;
            $subtotalsUpdated = 0;

            DB::transaction(function () use ($evaluation, $questions, $categories, &$subtotalsCreated, &$subtotalsUpdated) {
                foreach ($categories as $category) {
                    // Get questions that belong to this category
                    $categoryQuestions = collect($questions)->filter(function ($q) use ($category) {
                        return $q['category_id'] === $category['id'];
                    })->all();

                    // Calculate actual score for this category
                    $actualScore = 0;
                    foreach ($categoryQuestions as $question) {
                        $score = $evaluation->scores()
                            ->where('questionnaire_item_id', $question['id'])
                            ->value('score');
                        
                        if ($score !== null) {
                            $actualScore += floatval($score);
                        }
                    }

                    // Calculate percentage
                    $maxScore = floatval($category['max_score'] ?? 0);
                    $scorePercentage = $maxScore > 0 
                        ? ($actualScore / $maxScore) * 100 
                        : 0;

                    // Create or update subtotal record
                    $subtotal = EvaluationSubtotal::updateOrCreate(
                        [
                            'evaluation_id' => $evaluation->id,
                            'questionnaire_category_id' => $category['id'],
                        ],
                        [
                            'category_name' => $category['category_name'],
                            'category_description' => $category['description'] ?? null,
                            'max_score' => $maxScore,
                            'actual_score' => $actualScore,
                            'question_count' => count($categoryQuestions),
                            'score_percentage' => round($scorePercentage, 2),
                        ]
                    );

                    // Track whether this was a create or update
                    if ($subtotal->wasRecentlyCreated) {
                        $subtotalsCreated++;
                    } else {
                        $subtotalsUpdated++;
                    }
                }
            });

            Log::info('Subtotals calculated and stored', [
                'evaluation_id' => $evaluation->id,
                'created' => $subtotalsCreated,
                'updated' => $subtotalsUpdated,
                'total_categories' => count($categories),
            ]);

            return [
                'success' => true,
                'message' => "Subtotals calculated: {$subtotalsCreated} created, {$subtotalsUpdated} updated",
                'created' => $subtotalsCreated,
                'updated' => $subtotalsUpdated,
                'category_count' => count($categories),
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating subtotals', [
                'evaluation_id' => $evaluation->id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Error calculating subtotals: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get subtotals for an evaluation formatted for display
     * 
     * @param Evaluation $evaluation
     * @return array
     */
    public static function getFormattedSubtotals(Evaluation $evaluation): array
    {
        return $evaluation->subtotals()
            ->orderBy('questionnaire_category_id')
            ->get()
            ->map(function ($subtotal) {
                return [
                    'id' => $subtotal->id,
                    'category_id' => $subtotal->questionnaire_category_id,
                    'category_name' => $subtotal->category_name,
                    'category_description' => $subtotal->category_description,
                    'actual_score' => floatval($subtotal->actual_score ?? 0),
                    'max_score' => floatval($subtotal->max_score),
                    'question_count' => $subtotal->question_count,
                    'percentage' => floatval($subtotal->score_percentage ?? 0),
                    'percentage_formatted' => $subtotal->getScorePercentageFormatted(),
                    'status' => $subtotal->getStatusLabel(),
                    'is_passed' => $subtotal->isPassed(),
                ];
            })
            ->toArray();
    }

    /**
     * Get summary statistics for all subtotals
     * 
     * @param Evaluation $evaluation
     * @return array
     */
    public static function getSummaryStats(Evaluation $evaluation): array
    {
        $subtotals = $evaluation->subtotals;

        if ($subtotals->isEmpty()) {
            return [
                'total_categories' => 0,
                'categories_passed' => 0,
                'categories_failed' => 0,
                'average_score_percentage' => 0,
                'highest_category_score' => null,
                'lowest_category_score' => null,
            ];
        }

        $passCount = $subtotals->filter(fn($s) => $s->isPassed())->count();
        $avgPercentage = $subtotals->avg('score_percentage') ?? 0;
        $highest = $subtotals->max('actual_score');
        $lowest = $subtotals->min('actual_score');

        return [
            'total_categories' => $subtotals->count(),
            'categories_passed' => $passCount,
            'categories_failed' => $subtotals->count() - $passCount,
            'average_score_percentage' => round($avgPercentage, 2),
            'highest_category_score' => $highest ? floatval($highest) : null,
            'lowest_category_score' => $lowest ? floatval($lowest) : null,
        ];
    }

    /**
     * Validate subtotals against evaluation scores
     * 
     * Checks if stored subtotals match recalculated values to ensure data integrity.
     * 
     * @param Evaluation $evaluation
     * @return array Validation result with any discrepancies found
     */
    public static function validateSubtotals(Evaluation $evaluation): array
    {
        $discrepancies = [];

        $version = $evaluation->questionnaireVersion;
        if (!$version) {
            return [
                'valid' => false,
                'message' => 'No questionnaire version',
                'discrepancies' => [],
            ];
        }

        $snapshot = $version->snapshot ?? [];
        $questions = $snapshot['questions'] ?? [];
        $categories = $snapshot['categories'] ?? [];

        foreach ($categories as $category) {
            $categoryQuestions = collect($questions)->filter(function ($q) use ($category) {
                return $q['category_id'] === $category['id'];
            });

            // Recalculate score
            $calculatedScore = 0;
            foreach ($categoryQuestions as $q) {
                $score = $evaluation->scores()
                    ->where('questionnaire_item_id', $q['id'])
                    ->value('score');
                if ($score !== null) {
                    $calculatedScore += floatval($score);
                }
            }

            // Get stored subtotal
            $storedSubtotal = $evaluation->subtotals()
                ->where('questionnaire_category_id', $category['id'])
                ->first();

            if (!$storedSubtotal) {
                $discrepancies[] = [
                    'category_id' => $category['id'],
                    'issue' => 'missing_subtotal',
                    'message' => "No subtotal record found for category {$category['category_name']}",
                ];
            } elseif (abs(floatval($storedSubtotal->actual_score ?? 0) - $calculatedScore) > 0.01) {
                $discrepancies[] = [
                    'category_id' => $category['id'],
                    'category_name' => $category['category_name'],
                    'issue' => 'score_mismatch',
                    'stored_score' => floatval($storedSubtotal->actual_score),
                    'calculated_score' => $calculatedScore,
                    'difference' => round($calculatedScore - floatval($storedSubtotal->actual_score), 2),
                ];
            }
        }

        return [
            'valid' => empty($discrepancies),
            'discrepancy_count' => count($discrepancies),
            'discrepancies' => $discrepancies,
        ];
    }

    /**
     * Delete subtotals for an evaluation
     * 
     * Used when evaluation is reset or deleted.
     * 
     * @param Evaluation $evaluation
     * @return bool Success status
     */
    public static function deleteSubtotals(Evaluation $evaluation): bool
    {
        try {
            $evaluation->subtotals()->delete();
            return true;
        } catch (\Exception $e) {
            Log::error('Error deleting subtotals', [
                'evaluation_id' => $evaluation->id,
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
