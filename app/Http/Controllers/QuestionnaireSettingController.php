<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireItem;
use App\Models\ScoreInterpretation;
use App\Models\QuestionnaireSetting;
use App\Models\EvaluationSnapshots;
use App\Services\QuestionnaireVersionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

/**
 * QuestionnaireSettingController
 * 
 * Purpose: Configuration management system for the GMEF (Gender and Development Evaluation Framework)
 * questionnaire. This controller handles Admin 1-only access to questionnaire settings.
 * 
 * Key Responsibilities:
 * 1. Global Configuration - Stores version info and passing score thresholds
 * 2. Questionnaire Structure Management - Manages categories and questions
 * 3. Score Management - Define max scores and score options
 * 4. Score Interpretations - Link scores to meaningful interpretations
 * 5. Data Integrity - Prevent violations and maintain consistency
 * 6. Evaluation Snapshots - Preserve questionnaire state at evaluation time
 * 
 * Only accessible to Admin 1 (role_id = 3)
 */
class QuestionnaireSettingController extends Controller
{
    /**
     * Display the questionnaire management page.
     * 
     * This is the main settings hub showing:
     * - Global configuration (version, passing score)
     * - Questionnaire categories
     * - Questions within each category
     * - Score interpretation ranges
     * - Summary statistics
     * 
     * @return \Inertia\Response
     */
    public function index()
    {
        \Log::debug('QuestionnaireSettingController@index called', [
            'user' => auth()->user()->only(['id', 'name', 'email', 'role_id']),
            'request' => request()->all()
        ]);
        
        // AUTOMATIC EQUAL DISTRIBUTION: Recalculate all categories
        // (scoring is now always automatic)
        $this->ensureAllDistributionsCurrent();
        
        // Get current questionnaire settings
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');
        $passingScore = QuestionnaireSetting::getValue('passing_score', '0.00');
        
        // Get questionnaire structure with full category and item details
        $categories = QuestionnaireCategory::with(['items' => function ($query) {
            $query->where('is_active', true)->orderBy('display_order');
        }])
        ->where('is_active', true)
        ->orderBy('display_order')
        ->get();

        // Get score interpretations ordered by minimum score
        $interpretations = ScoreInterpretation::orderBy('score_min')->get();

        // Get all questionnaire versions for version history display
        $versions = \App\Models\QuestionnaireVersion::with('evaluations')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($version) {
                // snapshot is already an array thanks to the model's 'array' cast
                $snapshot = $version->snapshot ?? [];
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'status' => $version->status,
                    'is_active' => $version->is_active,
                    'created_at' => $version->created_at->toIso8601String(),
                    'description' => $version->description,
                    'evaluation_count' => $version->evaluations->count(),
                    'snapshot' => $snapshot,
                ];
            })
            ->toArray();

        // Calculate system statistics
        $stats = $this->getSystemStatistics();

        return Inertia::render('admin1/questionnaire/index', [
            'settings' => [
                'version' => $currentVersion,
                'passing_score' => $passingScore,
            ],
            'categories' => $categories,
            'interpretations' => $interpretations,
            'versions' => $versions,
            'stats' => $stats,
        ]);
    }

    /**
     * Update questionnaire settings (version and passing score).
     * 
     * IMPORTANT: This now creates a NEW VERSION instead of overwriting.
     * When you update the questionnaire, a version snapshot is created.
     * Existing evaluations remain locked to their original versions.
     * Only new evaluations will use the new version.
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'version' => 'required|regex:/^\d+\.\d+$/',
            'passing_score' => 'required|numeric|min:0|max:999.99',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            // Create a new version with snapshot of current state
            $newVersion = QuestionnaireVersionService::createVersion(
                $request->version,
                $request->description ?? 'Questionnaire updated',
                (int)$request->passing_score
            );

            // Update the settings table for backward compatibility
            QuestionnaireSetting::setValue(
                'questionnaire_version', 
                $request->version,
                'Current questionnaire version'
            );

            QuestionnaireSetting::setValue(
                'passing_score', 
                number_format($request->passing_score, 2),
                'Minimum score required to pass evaluation'
            );

            // Log the change
            \Log::info('New questionnaire version created', [
                'user_id' => auth()->id(),
                'version_id' => $newVersion->id,
                'version' => $request->version,
                'passing_score' => $request->passing_score,
            ]);

            return redirect()->route('questionnaire.index')
                ->with('success', "Questionnaire version {$request->version} created successfully. Previous evaluations remain locked to their original versions.");
        } catch (\Exception $e) {
            \Log::error('Failed to create questionnaire version', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('questionnaire.index')
                ->with('error', 'Failed to create new version: ' . $e->getMessage());
        }
    }

    /**
     * Get system statistics about the questionnaire configuration.
     * 
     * Provides insight into:
     * - Total number of categories
     * - Total number of active questions
     * - Total maximum score possible
     * - Number of score interpretations
     * - Version information
     * 
     * @return array
     */
    private function getSystemStatistics(): array
    {
        $totalCategories = QuestionnaireCategory::where('is_active', true)->count();
        $totalItems = QuestionnaireItem::where('is_active', true)->count();
        $totalMaxScore = QuestionnaireCategory::where('is_active', true)->sum('max_score');
        $totalInterpretations = ScoreInterpretation::count();
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');
        $passingScore = QuestionnaireSetting::getValue('passing_score', '0.00');

        return [
            'total_categories' => $totalCategories,
            'total_items' => $totalItems,
            'total_max_score' => $totalMaxScore,
            'total_interpretations' => $totalInterpretations,
            'current_version' => $currentVersion,
            'passing_score' => $passingScore,
        ];
    }

    /**
     * Validate questionnaire integrity.
     * 
     * Checks that:
     * - All items have valid scores not exceeding category max
     * - Total scores align with score interpretations
     * - No orphaned questions (items without categories)
     * - Score interpretations cover reasonable range
     * 
     * @return array ['valid' => bool, 'errors' => array, 'warnings' => array]
     */
    public function validateIntegrity(): array
    {
        $errors = [];
        $warnings = [];

        // Check for items exceeding category max
        $invalidItems = DB::table('questionnaire_items as qi')
            ->join('questionnaire_categories as qc', 'qi.category_id', '=', 'qc.id')
            ->whereRaw('qi.max_score > qc.max_score')
            ->select('qi.id', 'qi.question', 'qi.max_score as item_max', 'qc.max_score as category_max')
            ->get();

        if ($invalidItems->count() > 0) {
            $errors[] = "Found {$invalidItems->count()} items with scores exceeding their category maximum";
        }

        // Check for orphaned items
        $orphanedItems = QuestionnaireItem::whereNotIn('category_id', 
            QuestionnaireCategory::pluck('id'))->count();

        if ($orphanedItems > 0) {
            $errors[] = "Found {$orphanedItems} items without valid categories";
        }

        // Check if categories have items
        $emptyCategories = QuestionnaireCategory::where('is_active', true)
            ->whereDoesntHave('items', function ($query) {
                $query->where('is_active', true);
            })
            ->count();

        if ($emptyCategories > 0) {
            $warnings[] = "Found {$emptyCategories} active categories without active items";
        }

        // Check score interpretations coverage
        $interpretations = ScoreInterpretation::orderBy('score_min')->get();
        if ($interpretations->isEmpty()) {
            $warnings[] = "No score interpretations configured";
        }

        return [
            'valid' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    /**
     * Create an evaluation snapshot.
     * 
     * Preserves the current questionnaire structure for historical accuracy.
     * Called when an evaluation is submitted to lock in the exact categories,
     * items, and scoring rules used for that evaluation.
     * 
     * Used for data integrity and audit trails.
     * 
     * @param int $evaluationId
     * @return EvaluationSnapshots
     */
    public function createEvaluationSnapshot(int $evaluationId): EvaluationSnapshots
    {
        $structure = [
            'version' => QuestionnaireSetting::getValue('questionnaire_version', '1.0'),
            'passing_score' => QuestionnaireSetting::getValue('passing_score', '0.00'),
            'categories' => QuestionnaireCategory::with('items')
                ->where('is_active', true)
                ->get()
                ->toArray(),
            'interpretations' => ScoreInterpretation::all()->toArray(),
            'created_at' => now(),
        ];

        return EvaluationSnapshots::create([
            'evaluation_id' => $evaluationId,
            'questionnaire_structure' => $structure,
        ]);
    }

    /**
     * Get total maximum possible score in the system.
     * 
     * Sums all active category maximum scores to determine
     * the ceiling for evaluation scoring.
     * 
     * @return float
     */
    public function getTotalMaxScore(): float
    {
        return (float) QuestionnaireCategory::where('is_active', true)->sum('max_score');
    }

    /**
     * Get interpretation for a given score.
     * 
     * Looks up the score interpretation range that matches the given score.
     * Used when displaying evaluation results to users.
     * 
     * @param float $score
     * @return ScoreInterpretation|null
     */
    public function getScoreInterpretation(float $score): ?ScoreInterpretation
    {
        return ScoreInterpretation::where('score_min', '<=', $score)
            ->where('score_max', '>=', $score)
            ->first();
    }

    /**
     * Check if a score passes the threshold.
     * 
     * Compares score against the configured passing score threshold.
     * Used for evaluation result determination.
     * 
     * @param float $score
     * @return bool
     */
    public function isPassing(float $score): bool
    {
        $passingScore = (float) QuestionnaireSetting::getValue('passing_score', '0.00');
        return $score >= $passingScore;
    }

    /**
     * AUTOMATIC EQUAL DISTRIBUTION
     * 
     * Recalculate all active categories
     * (scoring is now always automatic, no enabled flag check)
     * 
     * This runs EVERY TIME the index is loaded to guarantee
     * distributions are always current - NO MANUAL TRIGGER NEEDED.
     * 
     * @return void
     */
    private function ensureAllDistributionsCurrent(): void
    {
        try {
            // Find all ACTIVE categories
            $categories = QuestionnaireCategory::where('is_active', true)
                ->get();

            \Log::debug('Recalculating distributions for all categories', [
                'categories_to_check' => $categories->count(),
            ]);

            // Recalculate each one
            foreach ($categories as $category) {
                $this->recalculateCategoryDistribution($category->id);
            }
        } catch (\Exception $e) {
            \Log::warning('Error in ensureAllDistributionsCurrent', [
                'error' => $e->getMessage(),
            ]);
            // Don't fail - just log and continue
        }
    }

    /**
     * Recalculate distribution for a specific category
     * 
     * (Scoring is now always automatic, no enabled flag check)
     * 
     * @param int $categoryId
     * @return void
     */
    private function recalculateCategoryDistribution(int $categoryId): void
    {
        try {
            $category = QuestionnaireCategory::findOrFail($categoryId);

            // Get all ACTIVE questions
            $activeQuestions = QuestionnaireItem::where('category_id', $categoryId)
                ->where('is_active', true)
                ->get();

            $questionCount = $activeQuestions->count();
            
            if ($questionCount === 0) {
                return; // No questions to distribute
            }

            // Calculate per-question score
            $categoryMax = (float) $category->max_score;
            $scorePerQuestion = $categoryMax / $questionCount;
            $halfScore = $scorePerQuestion / 2;

            // Create score options string
            $scoreOptions = "0," . round($halfScore, 8) . "," . round($scorePerQuestion, 8);

            // Update ALL questions with the calculated score
            $updatedCount = 0;
            foreach ($activeQuestions as $question) {
                $oldScore = (float) $question->max_score;
                $newScore = round($scorePerQuestion, 8);
                
                // Only update if value actually changed (optimization)
                if (abs($oldScore - $newScore) > 0.0001 || $question->score_options !== $scoreOptions) {
                    $question->update([
                        'max_score' => $newScore,
                        'score_options' => $scoreOptions,
                    ]);
                    $updatedCount++;
                }
            }

            if ($updatedCount > 0) {
                \Log::info('Auto-recalculated equal distribution', [
                    'category_id' => $categoryId,
                    'category_name' => $category->category_name,
                    'question_count' => $questionCount,
                    'score_per_question' => round($scorePerQuestion, 8),
                    'questions_updated' => $updatedCount,
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('Error recalculating category distribution', [
                'category_id' => $categoryId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
