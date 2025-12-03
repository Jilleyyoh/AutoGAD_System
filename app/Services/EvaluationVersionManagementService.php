<?php

namespace App\Services;

use App\Models\Evaluation;
use App\Models\Project;
use App\Models\QuestionnaireVersion;
use Illuminate\Support\Facades\Log;

/**
 * EvaluationVersionManagementService
 * 
 * Manages questionnaire version assignment for evaluations based on project status.
 * Implements the controlled reevaluation feature:
 * - Pending/For Evaluation: Uses latest active version
 * - Certified/Locked: Uses version from certification (immutable)
 * - For Reevaluation: Unlocks and switches to latest version
 */
class EvaluationVersionManagementService
{
    /**
     * Determine the correct questionnaire version for an evaluation
     * 
     * Business Logic:
     * 1. If project is FOR REEVALUATION: Use latest active version (unlock from old)
     * 2. If project is CERTIFIED: Use the locked version (immutable)
     * 3. If evaluation already exists with version: Keep using that version
     * 4. Otherwise: Use latest active version (new evaluation)
     * 
     * @param Project $project The project being evaluated
     * @param Evaluation|null $existingEvaluation Existing evaluation if any
     * @return QuestionnaireVersion
     */
    public static function determineQuestionnaireVersion(
        Project $project,
        ?Evaluation $existingEvaluation = null
    ): QuestionnaireVersion {
        // Check if this is a reevaluation scenario
        if (self::isProjectForReevaluation($project)) {
            // Reevaluation: Get latest version (unlock from old version)
            $version = QuestionnaireVersionService::getActiveVersion();
            
            $statusName = $project->projectStatus?->name;
            if ($statusName === 'for_correction') {
                $statusName = 'revision';
            }

            Log::info('Reevaluation detected: Switching to latest version', [
                'project_id' => $project->id,
                'project_status' => $statusName,
                'new_version_id' => $version?->id,
                'new_version_number' => $version?->version_number,
            ]);
            
            return $version;
        }

        // If evaluation already exists, keep its version (locked)
        if ($existingEvaluation && $existingEvaluation->questionnaire_version_id) {
            return $existingEvaluation->questionnaireVersion;
        }

        // New evaluation or no version set: Use active version
        return QuestionnaireVersionService::getActiveVersion();
    }

    /**
     * Check if project is in a reevaluation state
     * 
     * Reevaluation states:
     * - for_revision: Returned from Admin2 for evaluator revision
     * - for_correction: Returned for correction by proponent
     * - on_hold: Temporarily on hold, can be re-evaluated
     * 
     * @param Project $project
     * @return bool
     */
    public static function isProjectForReevaluation(Project $project): bool
    {
        if (!$project->projectStatus) {
            return false;
        }

        $statusName = $project->projectStatus->name;
        if ($statusName === 'for_correction') {
            $statusName = 'for_revision';
        }

        $reevaluationStatuses = [
            'revision',      // Returned from Admin2 or legacy for_correction
            'revised',           // Proponent has submitted revisions
            'on_hold',           // On hold, can reevaluate
        ];

        return in_array($statusName, $reevaluationStatuses);
    }

    /**
     * Handle version update when project enters reevaluation state
     * 
     * When a certified project is sent back for reevaluation:
     * 1. Update evaluation to use latest version
     * 2. Preserve audit trail (log the change)
     * 3. Reset evaluation status to pending
     * 
     * @param Project $project
     * @return bool Success status
     */
    /**
     * Unlock evaluation for reevaluation.
     *
     * If an $evaluatorId is provided, target the evaluation record for that evaluator.
     * Otherwise, operate on the first evaluation found for the project (legacy behavior).
     *
     * @param Project $project
     * @param int|null $evaluatorId
     * @return bool
     */
    public static function unlockForReevaluation(Project $project, ?int $evaluatorId = null): bool
    {
        try {
            $latestVersion = QuestionnaireVersionService::getActiveVersion();
            
            if (!$latestVersion) {
                Log::warning('No active version available for reevaluation', [
                    'project_id' => $project->id,
                ]);
                return false;
            }

            // Find the evaluation to update. Prefer the evaluator-specific evaluation if provided.
            $query = Evaluation::where('project_id', $project->id);
            if ($evaluatorId) {
                $query->where('evaluator_id', $evaluatorId);
            }
            $evaluation = $query->first();

            if (!$evaluation) {
                Log::warning('No evaluation found for reevaluation unlock', [
                    'project_id' => $project->id,
                ]);
                return false;
            }

            $oldVersionId = $evaluation->questionnaire_version_id;

            // Update to new version
            $evaluation->update([
                'questionnaire_version_id' => $latestVersion->id,
                'status_id' => 1, // Reset to for-evaluation (ID: 1)
            ]);

            $statusName = $project->projectStatus?->name;
            if ($statusName === 'for_correction') {
                $statusName = 'revision';
            }

            Log::info('Evaluation unlocked and updated for reevaluation', [
                'project_id' => $project->id,
                'evaluation_id' => $evaluation->id,
                'old_version_id' => $oldVersionId,
                'new_version_id' => $latestVersion->id,
                'new_version_number' => $latestVersion->version_number,
                'project_status' => $statusName,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error unlocking evaluation for reevaluation', [
                'project_id' => $project->id,
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Check if evaluation is locked to a specific version
     * (i.e., project is certified or in a locked state)
     * 
     * @param Project $project
     * @return bool
     */
    public static function isEvaluationLocked(Project $project): bool
    {
        if (!$project->projectStatus) {
            return false;
        }

        $lockedStatuses = [
            'certified',        // Certified and locked
            'completed',        // Completed and locked
            'approved',         // Approved and locked
            'declined',         // Declined and locked
        ];

        return in_array($project->projectStatus->name, $lockedStatuses);
    }

    /**
     * Get version history for an evaluation
     * 
     * @param Evaluation $evaluation
     * @return array
     */
    public static function getVersionHistory(Evaluation $evaluation): array
    {
        // This can be extended to maintain full audit trail
        // For now, returns current version information
        
        return [
            'current_version_id' => $evaluation->questionnaire_version_id,
            'current_version' => $evaluation->questionnaireVersion?->version_number,
            'current_version_created_at' => $evaluation->questionnaireVersion?->created_at?->format('Y-m-d H:i:s'),
            'evaluation_status' => $evaluation->status?->name ?? 'unknown',
            'evaluation_created_at' => $evaluation->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get version locking status for a project
     * 
     * Returns detailed information about version binding
     * 
     * @param Project $project
     * @return array
     */
    public static function getVersionLockingStatus(Project $project): array
    {
        $evaluation = Evaluation::where('project_id', $project->id)->first();
        
        if (!$evaluation) {
            return [
                'is_locked' => false,
                'is_for_reevaluation' => self::isProjectForReevaluation($project),
                'status' => 'no_evaluation',
            ];
        }

        $isLocked = self::isEvaluationLocked($project);
        $isForReevaluation = self::isProjectForReevaluation($project);

        $projectStatusName = $project->projectStatus?->name;
        if ($projectStatusName === 'for_correction') {
            $projectStatusName = 'revision';
        }

        return [
            'is_locked' => $isLocked,
            'is_for_reevaluation' => $isForReevaluation,
            'version_id' => $evaluation->questionnaire_version_id,
            'version_number' => $evaluation->questionnaireVersion?->version_number,
            'project_status' => $projectStatusName,
            'evaluation_status' => $evaluation->status?->name,
            'created_at' => $evaluation->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $evaluation->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Check if evaluation should auto-refresh to new version
     * 
     * Smart version refresh logic:
     * - REFRESH if: Incomplete evaluation AND new version available AND not certified
     * - KEEP if: Evaluation submitted/completed (preserve for consistency)
     * - KEEP if: Project certified (immutable)
     * - REFRESH if: Project marked for reevaluation (explicit unlock)
     * 
     * @param Project $project
     * @param Evaluation $evaluation
     * @return bool
     */
    public static function shouldAutoRefreshVersion(Project $project, Evaluation $evaluation): bool
    {
        // Never auto-refresh completed/submitted evaluations
        if ($evaluation->status_id !== 1) { // 1 = for_evaluation / pending-equivalent
            return false;
        }

        // Certified projects never auto-refresh
        if (self::isEvaluationLocked($project)) {
            return false;
        }

        // Check if a new version exists
        $currentVersion = $evaluation->questionnaireVersion;
        $latestVersion = QuestionnaireVersionService::getActiveVersion();

        if (!$latestVersion || !$currentVersion) {
            return false;
        }

        // If on different version AND latest is newer, should refresh
        return $latestVersion->id !== $currentVersion->id 
            && $latestVersion->created_at > $currentVersion->created_at;
    }

    /**
     * Auto-refresh evaluation to latest questionnaire version
     * 
     * This is a non-destructive operation that updates incomplete evaluations
     * to use the latest questionnaire version when available.
     * 
     * Intended for scenarios where:
     * - Admin 1 creates new version while evaluators are working
     * - Incomplete evaluations should automatically use the latest config
     * - Completed evaluations remain locked to their version
     * 
     * @param Project $project
     * @param Evaluation $evaluation
     * @return array Result with status and message
     */
    public static function autoRefreshVersion(Project $project, Evaluation $evaluation): array
    {
        try {
            // Check if refresh should happen
            if (!self::shouldAutoRefreshVersion($project, $evaluation)) {
                return [
                    'success' => false,
                    'reason' => 'auto_refresh_not_applicable',
                    'message' => 'Evaluation does not meet criteria for auto-refresh',
                ];
            }

            $oldVersion = $evaluation->questionnaireVersion;
            $newVersion = QuestionnaireVersionService::getActiveVersion();

            // Check if snapshot integrity is maintained
            if (!$newVersion || empty($newVersion->snapshot)) {
                return [
                    'success' => false,
                    'reason' => 'invalid_new_version',
                    'message' => 'New version has no valid snapshot',
                ];
            }

            // Update evaluation to new version
            $evaluation->update([
                'questionnaire_version_id' => $newVersion->id,
                'updated_at' => now(),
            ]);

            Log::info('Evaluation auto-refreshed to new version', [
                'project_id' => $project->id,
                'evaluation_id' => $evaluation->id,
                'old_version_id' => $oldVersion->id,
                'old_version_number' => $oldVersion->version_number,
                'new_version_id' => $newVersion->id,
                'new_version_number' => $newVersion->version_number,
                'reason' => 'automatic_refresh_on_page_load',
            ]);

            return [
                'success' => true,
                'reason' => 'version_refreshed',
                'message' => "Questionnaire automatically updated from v{$oldVersion->version_number} to v{$newVersion->version_number}",
                'old_version_number' => $oldVersion->version_number,
                'new_version_number' => $newVersion->version_number,
            ];
        } catch (\Exception $e) {
            Log::error('Error during auto-refresh version', [
                'project_id' => $project->id,
                'evaluation_id' => $evaluation->id,
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'reason' => 'error',
                'message' => 'Error during version refresh',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get version status with auto-refresh indication
     * 
     * Returns status information including whether auto-refresh occurred
     * or should occur.
     * 
     * @param Project $project
     * @param Evaluation $evaluation
     * @return array
     */
    public static function getVersionStatusWithAutoRefresh(Project $project, Evaluation $evaluation): array
    {
        $latestVersion = QuestionnaireVersionService::getActiveVersion();
        $currentVersion = $evaluation->questionnaireVersion;
        $isOutOfDate = $latestVersion && $currentVersion && $latestVersion->id !== $currentVersion->id;

        $projectStatusName = $project->projectStatus?->name;
        if ($projectStatusName === 'for_correction') {
            $projectStatusName = 'revision';
        }

        return [
            'current_version_id' => $evaluation->questionnaire_version_id,
            'current_version_number' => $currentVersion?->version_number,
            'latest_version_id' => $latestVersion?->id,
            'latest_version_number' => $latestVersion?->version_number,
            'is_out_of_date' => $isOutOfDate,
            'is_locked' => self::isEvaluationLocked($project),
            'can_auto_refresh' => self::shouldAutoRefreshVersion($project, $evaluation),
            'evaluation_status_id' => $evaluation->status_id,
            'project_status' => $projectStatusName,
        ];
    }
}
