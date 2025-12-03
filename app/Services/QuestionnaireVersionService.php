<?php

namespace App\Services;

use App\Models\QuestionnaireVersion;
use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireItem;
use App\Models\QuestionnaireSetting;
use Illuminate\Support\Facades\Log;

/**
 * QuestionnaireVersionService
 * 
 * Manages questionnaire version snapshots and ensures evaluations
 * are locked to specific versions.
 */
class QuestionnaireVersionService
{
    /**
     * Create a new questionnaire version with snapshot
     * 
     * Captures the current state of all categories and questions
     * and creates an immutable snapshot for this version.
     * 
     * @param string $versionNumber The version identifier (e.g., "2.0")
     * @param string|null $description Description of changes in this version
     * @param int $passingScore The passing score threshold for this version
     * @return QuestionnaireVersion
     */
    public static function createVersion(
        string $versionNumber,
        ?string $description = null,
        int $passingScore = 0
    ): QuestionnaireVersion {
        // Archive previous active version
        QuestionnaireVersion::where('is_active', true)->update([
            'is_active' => false,
            'status' => 'archived',
            'archived_at' => now(),
        ]);

        // Create snapshot of current questionnaire state
        $snapshot = self::captureSnapshot();

        // Create new version
        $version = QuestionnaireVersion::create([
            'version_number' => $versionNumber,
            'description' => $description,
            'is_active' => true,
            'status' => 'active',
            'snapshot' => $snapshot,
            'passing_score' => $passingScore,
        ]);

        Log::info("Created questionnaire version {$versionNumber}", [
            'user_id' => auth()->id(),
            'categories_count' => count($snapshot['categories'] ?? []),
            'questions_count' => count($snapshot['questions'] ?? []),
        ]);

        return $version;
    }

    /**
     * Capture complete snapshot of current questionnaire state
     * 
     * @return array Complete snapshot including all categories, questions, and settings
     */
    public static function captureSnapshot(): array
    {
        $categories = QuestionnaireCategory::where('is_active', true)
            ->orderBy('display_order')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'category_name' => $cat->category_name,
                    'description' => $cat->description,
                    'max_score' => (float)$cat->max_score,
                    'display_order' => $cat->display_order,
                    'version' => $cat->version,
                ];
            })
            ->toArray();

        $questions = QuestionnaireItem::where('is_active', true)
            ->orderBy('category_id')
            ->orderBy('display_order')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'category_id' => $item->category_id,
                    'item_number' => $item->item_number,
                    'question' => $item->question,
                    'score_options' => $item->score_options,
                    'max_score' => (float)$item->max_score,
                    'display_order' => $item->display_order,
                    'version' => $item->version,
                ];
            })
            ->toArray();

        $settings = [
            'passing_score' => QuestionnaireSetting::getValue('passing_score', '0.00'),
            'created_date' => now()->format('Y-m-d H:i:s'),
        ];

        return [
            'categories' => $categories,
            'questions' => $questions,
            'settings' => $settings,
            'total_max_score' => collect($categories)->sum('max_score'),
            'question_count' => count($questions),
            'category_count' => count($categories),
        ];
    }

    /**
     * Get the active questionnaire version
     * 
     * @return QuestionnaireVersion|null
     */
    public static function getActiveVersion(): ?QuestionnaireVersion
    {
        return QuestionnaireVersion::where('is_active', true)->first();
    }

    /**
     * Get all versions with their status
     * 
     * @return array
     */
    public static function getAllVersions(): array
    {
        return QuestionnaireVersion::orderByDesc('created_at')
            ->get()
            ->map(function ($version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'status' => $version->status,
                    'is_active' => $version->is_active,
                    'created_at' => $version->created_at->format('Y-m-d H:i:s'),
                    'archived_at' => $version->archived_at?->format('Y-m-d H:i:s'),
                    'evaluation_count' => $version->evaluationCount(),
                    'is_locked' => $version->isLocked(),
                    'description' => $version->description,
                ];
            })
            ->toArray();
    }

    /**
     * Get version for a specific evaluation
     * 
     * @param int $versionId
     * @return QuestionnaireVersion|null
     */
    public static function getVersion(int $versionId): ?QuestionnaireVersion
    {
        return QuestionnaireVersion::find($versionId);
    }

    /**
     * Check if version can be modified
     * 
     * @param int $versionId
     * @return bool
     */
    public static function canModifyVersion(int $versionId): bool
    {
        $version = self::getVersion($versionId);
        if (!$version) {
            return false;
        }

        // Can only modify if no evaluations use it
        return !$version->isLocked();
    }

    /**
     * Get comparison between two versions
     * 
     * @param int $version1Id
     * @param int $version2Id
     * @return array
     */
    public static function compareVersions(int $version1Id, int $version2Id): array
    {
        $v1 = self::getVersion($version1Id);
        $v2 = self::getVersion($version2Id);

        if (!$v1 || !$v2) {
            return [];
        }

        return [
            'version_1' => [
                'number' => $v1->version_number,
                'categories' => count($v1->getCategories()),
                'questions' => count($v1->getQuestions()),
                'total_score' => $v1->snapshot['total_max_score'] ?? 0,
            ],
            'version_2' => [
                'number' => $v2->version_number,
                'categories' => count($v2->getCategories()),
                'questions' => count($v2->getQuestions()),
                'total_score' => $v2->snapshot['total_max_score'] ?? 0,
            ],
        ];
    }
}
