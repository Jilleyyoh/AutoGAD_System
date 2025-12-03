<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

/**
 * NotificationService
 *
 * Centralized notification management service for the GAD System.
 * Handles creation, delivery, and management of all system notifications.
 *
 * Responsibilities:
 * - Create role-specific notifications
 * - Handle template variable replacement
 * - Resolve notification recipients
 * - Manage notification lifecycle
 * - Log notification activities
 *
 * Notification Types:
 * - project_assigned
 * - evaluation_completed_declined
 * - evaluation_completed_approved
 * - evaluation_completed_revision
 * - approved_for_certification
 * - returned_for_review
 * - certificate_generated
 * - message_received
 * - message_replied
 * - project_submitted
 * - project_revised
 * - project_approved_by_evaluator
 */
class NotificationService
{
    /**
     * Create a notification with all necessary data
     *
     * @param int $userId - Target user ID
     * @param string $title - Notification title
     * @param string $message - Notification message
     * @param string $type - Notification type
     * @param int|null $relatedId - Related entity ID (project, evaluation, conversation)
     * @param string|null $link - Route name or URL
     * @param string|null $actionUrl - Fully constructed URL
     * @return Notification|null
     */
    public static function create(
        int $userId,
        string $title,
        string $message,
        string $type,
        ?int $relatedId = null,
        ?string $link = null,
        ?string $actionUrl = null
    ): ?Notification {
        try {
            $notification = Notification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'related_id' => $relatedId,
                'link' => $link,
                'action_url' => $actionUrl,
            ]);

            Log::info('Notification created', [
                'notification_id' => $notification->id,
                'user_id' => $userId,
                'type' => $type,
            ]);

            return $notification;
        } catch (\Exception $e) {
            Log::error('Error creating notification', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Create notification for multiple users
     *
     * @param array $userIds - Array of user IDs
     * @param string $title
     * @param string $message
     * @param string $type
     * @param int|null $relatedId
     * @param string|null $link
     * @param string|null $actionUrl
     * @return array - Array of created notifications
     */
    public static function createBatch(
        array $userIds,
        string $title,
        string $message,
        string $type,
        ?int $relatedId = null,
        ?string $link = null,
        ?string $actionUrl = null
    ): array {
        $notifications = [];

        foreach ($userIds as $userId) {
            $notification = self::create(
                $userId,
                $title,
                $message,
                $type,
                $relatedId,
                $link,
                $actionUrl
            );

            if ($notification) {
                $notifications[] = $notification;
            }
        }

        return $notifications;
    }

    /**
     * ROLE 1 - PROPONENT NOTIFICATIONS
     */

    /**
     * Notify proponent: Project assigned to evaluator (by Admin1)
     */
    public static function notifyProponentProjectAssigned($project): ?Notification {
        $proponent = $project->proponent;
        if (!$proponent || !$proponent->user) {
            return null;
        }

        $message = self::replaceTemplateVariables(
            '[Project Code] has been assigned to an evaluator. Please wait for the evaluation result.',
            ['Project Code' => $project->project_code]
        );

        return self::create(
            $proponent->user->id,
            'Project Assigned',
            $message,
            'project_assigned',
            $project->id,
            'proponent.pap.submissions.show',
            route('proponent.pap.submissions.show', $project)
        );
    }

    /**
     * Notify proponent: Evaluation completed (by Evaluator)
     */
    public static function notifyProponentEvaluationCompleted($project, string $status): ?Notification {
        $proponent = $project->proponent;
        if (!$proponent || !$proponent->user) {
            return null;
        }

        $messages = [
            'declined' => '[Project Code] was declined by the evaluator. See for more information.',
            'approved' => '[Project Code] was approved by the evaluator. See for more information.',
            'revision' => '[Project Code] requires revisions. See for more information.',
        ];

        $types = [
            'declined' => 'evaluation_completed_declined',
            'approved' => 'evaluation_completed_approved',
            'revision' => 'evaluation_completed_revision',
        ];

        $title = [
            'declined' => 'Project Declined',
            'approved' => 'Project Approved',
            'revision' => 'Revision Required',
        ];

        $message = self::replaceTemplateVariables(
            $messages[$status] ?? $messages['approved'],
            ['Project Code' => $project->project_code]
        );

        // Route based on status
        if ($status === 'revision') {
            // Revision redirects to revision page
            $link = 'proponent.pap.revise.show';
            $url = route('proponent.pap.revise.show', $project);
        } else {
            // Approved and Declined redirect to submissions list with highlight
            $link = 'proponent.pap.submissions';
            $url = route('proponent.pap.submissions', ['highlight' => $project->id]);
        }

        return self::create(
            $proponent->user->id,
            $title[$status] ?? 'Evaluation Update',
            $message,
            $types[$status] ?? 'evaluation_completed_approved',
            $project->id,
            $link,
            $url
        );
    }

    /**
     * Notify proponent: For Certification (by Admin2)
     */
    public static function notifyProponentApprovedForCertification($project): ?Notification {
        $proponent = $project->proponent;
        if (!$proponent || !$proponent->user) {
            return null;
        }

        $message = self::replaceTemplateVariables(
            '[Project Code] is now for certification.',
            ['Project Code' => $project->project_code]
        );

        return self::create(
            $proponent->user->id,
            'For Certification',
            $message,
            'for_certification',
            $project->id,
            'proponent.pap.submissions',
            route('proponent.pap.submissions', ['highlight' => $project->id])
        );
    }

    /**
     * Notify proponent: In Review (by Admin2)
     */
    public static function notifyProponentReturnedForReview($project): ?Notification {
        $proponent = $project->proponent;
        if (!$proponent || !$proponent->user) {
            return null;
        }

        $message = self::replaceTemplateVariables(
            '[Project Code] is now in review. Please wait for the evaluation results.',
            ['Project Code' => $project->project_code]
        );

        return self::create(
            $proponent->user->id,
            'In Review',
            $message,
            'in_review',
            $project->id,
            'proponent.pap.submissions',
            route('proponent.pap.submissions', ['highlight' => $project->id])
        );
    }

    /**
     * Notify proponent: Certified (by Admin2)
     */
    public static function notifyProponentCertificateGenerated($project): ?Notification {
        $proponent = $project->proponent;
        if (!$proponent || !$proponent->user) {
            return null;
        }

        // Find the certificate for this project to get the certificate ID
        $certificate = Certificate::where('project_id', $project->id)->latest()->first();
        $certificateId = $certificate?->id ?? $project->id;

        $message = self::replaceTemplateVariables(
            '[Project Code] is now certified.',
            ['Project Code' => $project->project_code]
        );

        return self::create(
            $proponent->user->id,
            'Certified',
            $message,
            'certified',
            $certificateId,
            'proponent.certificates.index',
            route('proponent.certificates.index', ['highlight' => $certificateId])
        );
    }

    /**
     * Notify proponent: Message reply from Admin2
     */
    public static function notifyProponentMessageReply($conversation): ?Notification {
        if (!$conversation->proponent || !$conversation->proponent->user) {
            return null;
        }

        return self::create(
            $conversation->proponent->user->id,
            'New Message Reply',
            'Admin 2 has replied to your message. See for more information.',
            'message_replied',
            $conversation->id,
            'proponent.conversations.show',
            route('proponent.conversations.show', $conversation->id)
        );
    }

    /**
     * ROLE 2 - EVALUATOR NOTIFICATIONS
     */

    /**
     * Notify evaluator: New project assigned (by Admin1)
     */
    public static function notifyEvaluatorProjectAssigned($project, $evaluator, bool $isRevision = false): ?Notification {
        if (!$evaluator || !$evaluator->user) {
            return null;
        }

        if ($isRevision) {
            $message = self::replaceTemplateVariables(
                '[Project Code] has been revised. Please re-evaluate.',
                ['Project Code' => $project->project_code]
            );

            return self::create(
                $evaluator->user->id,
                'Revised Project Assigned',
                $message,
                'project_assigned_revision',
                $project->id,
                'evaluator.evaluations.show',
                route('evaluator.evaluations.show', $project->id)
            );
        } else {
            $message = self::replaceTemplateVariables(
                'A new project needs evaluation: [Project Code]. See for more information.',
                ['Project Code' => $project->project_code]
            );

            return self::create(
                $evaluator->user->id,
                'New Project Assignment',
                $message,
                'project_assigned',
                $project->id,
                'evaluator.evaluations.show',
                route('evaluator.evaluations.show', $project->id)
            );
        }
    }

    /**
     * Notify evaluator: Project revised by proponent
     */
    public static function notifyEvaluatorProjectRevised($project, $evaluator): ?Notification {
        if (!$evaluator || !$evaluator->user) {
            return null;
        }

        $message = self::replaceTemplateVariables(
            '[Project Code] is revised. You can re-evaluate now. See for more details.',
            ['Project Code' => $project->project_code]
        );

        return self::create(
            $evaluator->user->id,
            'Project Revised',
            $message,
            'project_revised',
            $project->id,
            'evaluator.evaluations.show',
            route('evaluator.evaluations.show', $project->id)
        );
    }

    /**
     * Notify evaluator: Project approved for certification (by Admin2)
     */
    public static function notifyEvaluatorApprovedForCertification($project): ?Notification {
        // Get the evaluator(s) who evaluated this project
        $evaluations = $project->evaluations()->with('evaluator.user')->get();

        $notifications = [];
        foreach ($evaluations as $evaluation) {
            if ($evaluation->evaluator && $evaluation->evaluator->user) {
                $message = self::replaceTemplateVariables(
                    'The project you evaluated, [Project Code], is now for certification.',
                    ['Project Code' => $project->project_code]
                );

                $notification = self::create(
                    $evaluation->evaluator->user->id,
                    'For Certification',
                    $message,
                    'for_certification',
                    $project->id,
                    'evaluator.evaluations.index',
                    route('evaluator.evaluations.index', ['highlight' => $project->id])
                );

                if ($notification) {
                    $notifications[] = $notification;
                }
            }
        }

        return count($notifications) > 0 ? $notifications[0] : null;
    }

    /**
     * Notify evaluator: Returned for review (by Admin2)
     */
    public static function notifyEvaluatorReturnedForReview($project): ?Notification {
        $evaluations = $project->evaluations()->with('evaluator.user')->get();

        $notifications = [];
        foreach ($evaluations as $evaluation) {
            if ($evaluation->evaluator && $evaluation->evaluator->user) {
                $message = self::replaceTemplateVariables(
                    '[Project Code] is now in review. See for more information.',
                    ['Project Code' => $project->project_code]
                );

                $notification = self::create(
                    $evaluation->evaluator->user->id,
                    'In Review',
                    $message,
                    'in_review',
                    $project->id,
                    'evaluator.evaluations.index',
                    route('evaluator.evaluations.index', ['highlight' => $project->id])
                );

                if ($notification) {
                    $notifications[] = $notification;
                }
            }
        }

        return count($notifications) > 0 ? $notifications[0] : null;
    }

    /**
     * Notify evaluator: Certificate generated (by Admin2)
     */
    public static function notifyEvaluatorCertificateGenerated($project): ?Notification {
        // Find the certificate for this project to get the certificate ID
        $certificate = Certificate::where('project_id', $project->id)->latest()->first();
        $certificateId = $certificate?->id ?? $project->id;

        $evaluations = $project->evaluations()->with('evaluator.user')->get();

        $notifications = [];
        foreach ($evaluations as $evaluation) {
            if ($evaluation->evaluator && $evaluation->evaluator->user) {
                $message = self::replaceTemplateVariables(
                    '[Project Code] you evaluated is now certified.',
                    ['Project Code' => $project->project_code]
                );

                $notification = self::create(
                    $evaluation->evaluator->user->id,
                    'Certified',
                    $message,
                    'certified',
                    $certificateId,
                    'evaluator.certificates.index',
                    route('evaluator.certificates.index', ['highlight' => $certificateId])
                );

                if ($notification) {
                    $notifications[] = $notification;
                }
            }
        }

        return count($notifications) > 0 ? $notifications[0] : null;
    }

    /**
     * ROLE 3 - ADMIN1 NOTIFICATIONS
     */

    /**
     * Notify Admin1: New project submitted (by Proponent)
     */
    public static function notifyAdmin1ProjectSubmitted($project, bool $isRevision = false): ?Notification {
        $admin1Users = User::where('role_id', 3)->get();

        if ($isRevision) {
            $message = self::replaceTemplateVariables(
                '[Project Code] has been revised. Re-assign it and review the details.',
                ['Project Code' => $project->project_code]
            );
        } else {
            $message = self::replaceTemplateVariables(
                'A new PAP has been submitted by [Organization Name]. Assign it to an evaluator now.',
                ['Organization Name' => $project->proponent?->organization ?? 'Unknown Organization']
            );
        }

        $type = $isRevision ? 'project_revised' : 'project_submitted';
        $title = $isRevision ? 'Project Revised' : 'New Project Submitted';

        return self::createBatch(
            $admin1Users->pluck('id')->toArray(),
            $title,
            $message,
            $type,
            $project->id,
            'admin1.assignments.index',
            route('admin1.assignments.index', ['highlight' => $project->id])
        )[0] ?? null;
    }

    /**
     * Notify Admin1: Evaluation completed (by Evaluator)
     */
    public static function notifyAdmin1EvaluationCompleted($project, string $status): ?Notification {
        $admin1Users = User::where('role_id', 3)->get();

        $messages = [
            'declined' => '[Project Code] was declined by the evaluator. See for more info.',
            'approved' => '[Project Code] was approved by the evaluator. See for more info.',
            'revision' => '[Project Code] requires revisions. See for more info.',
        ];

        $types = [
            'declined' => 'evaluation_completed_declined',
            'approved' => 'evaluation_completed_approved',
            'revision' => 'evaluation_completed_revision',
        ];

        $titles = [
            'declined' => 'Project Declined',
            'approved' => 'Project Approved',
            'revision' => 'Revision Required',
        ];

        $message = self::replaceTemplateVariables(
            $messages[$status] ?? $messages['approved'],
            ['Project Code' => $project->project_code]
        );

        return self::createBatch(
            $admin1Users->pluck('id')->toArray(),
            $titles[$status] ?? 'Evaluation Update',
            $message,
            $types[$status] ?? 'evaluation_completed_approved',
            $project->id,
            'admin1.assignments.index',
            route('admin1.assignments.index', ['highlight' => $project->id])
        )[0] ?? null;
    }

    /**
     * Notify Admin1: Approved for certification (by Admin2)
     */
    public static function notifyAdmin1ApprovedForCertification($project): ?Notification {
        $admin1Users = User::where('role_id', 3)->get();

        $message = self::replaceTemplateVariables(
            '[Project Code] has been approved for certification.',
            ['Project Code' => $project->project_code]
        );

        return self::createBatch(
            $admin1Users->pluck('id')->toArray(),
            'For Certification',
            $message,
            'for_certification',
            $project->id,
            'admin1.assignments.index',
            route('admin1.assignments.index', ['highlight' => $project->id])
        )[0] ?? null;
    }

    /**
     * Notify Admin1: In Review (by Admin2)
     */
    public static function notifyAdmin1ReturnedForReview($project): ?Notification {
        $admin1Users = User::where('role_id', 3)->get();

        $message = self::replaceTemplateVariables(
            '[Project Code] is now in review.',
            ['Project Code' => $project->project_code]
        );

        return self::createBatch(
            $admin1Users->pluck('id')->toArray(),
            'In Review',
            $message,
            'in_review',
            $project->id,
            'admin1.assignments.index',
            route('admin1.assignments.index', ['highlight' => $project->id])
        )[0] ?? null;
    }

    /**
     * Notify Admin1: Certified (by Admin2)
     */
    public static function notifyAdmin1CertificateGenerated($project): ?Notification {
        // Find the certificate for this project to get the certificate ID
        $certificate = Certificate::where('project_id', $project->id)->latest()->first();
        $certificateId = $certificate?->id ?? $project->id;

        $admin1Users = User::where('role_id', 3)->get();

        $message = self::replaceTemplateVariables(
            '[Project Code] is now certified.',
            ['Project Code' => $project->project_code]
        );

        return self::createBatch(
            $admin1Users->pluck('id')->toArray(),
            'Certified',
            $message,
            'certified',
            $certificateId,
            'admin1.certificates.index',
            route('admin1.certificates.index', ['highlight' => $certificateId])
        )[0] ?? null;
    }

    /**
     * ROLE 4 - ADMIN2 NOTIFICATIONS
     */

    /**
     * Notify Admin2: New message from Proponent
     */
    public static function notifyAdmin2MessageReceived($conversation): ?Notification {
        // Get all Admin2 users
        $admin2Users = User::where('role_id', 4)->get();

        $message = self::replaceTemplateVariables(
            '[Proponent Name] has sent you a message.',
            ['Proponent Name' => $conversation->proponent?->user?->name ?? 'A proponent']
        );

        return self::createBatch(
            $admin2Users->pluck('id')->toArray(),
            'New Message',
            $message,
            'message_received',
            $conversation->id,
            'admin2.conversations.show',
            route('admin2.conversations.show', $conversation->id)
        )[0] ?? null;
    }

    /**
     * Notify Admin2: Message reply from Proponent
     */
    public static function notifyAdmin2MessageReply($conversation): ?Notification {
        $admin2Users = User::where('role_id', 4)->get();

        $message = self::replaceTemplateVariables(
            '[Proponent Name] has replied to your message.',
            ['Proponent Name' => $conversation->proponent?->user?->name ?? 'A proponent']
        );

        return self::createBatch(
            $admin2Users->pluck('id')->toArray(),
            'Message Reply',
            $message,
            'message_replied',
            $conversation->id,
            'admin2.conversations.show',
            route('admin2.conversations.show', $conversation->id)
        )[0] ?? null;
    }

    /**
     * Notify Admin2: Project approved by evaluator
     */
    public static function notifyAdmin2ProjectApprovedByEvaluator($project, $evaluator): ?Notification {
        Log::info('notifyAdmin2ProjectApprovedByEvaluator called', [
            'project_id' => $project->id,
            'evaluator_id' => $evaluator->id,
            'evaluator_name' => $evaluator->user?->name ?? 'Unknown',
        ]);

        $admin2Users = User::where('role_id', 4)->get();

        Log::info('Found Admin2 users', ['count' => $admin2Users->count(), 'user_ids' => $admin2Users->pluck('id')->toArray()]);

        $message = self::replaceTemplateVariables(
            'A project has been approved by [Evaluator Name]. See for more details.',
            ['Evaluator Name' => $evaluator->user?->name ?? 'An evaluator']
        );

        $result = self::createBatch(
            $admin2Users->pluck('id')->toArray(),
            'Project Approved by Evaluator',
            $message,
            'project_approved_by_evaluator',
            $project->id,
            'admin2.evaluations.review',
            route('admin2.evaluations.review', ['projectId' => $project->id])
        );

        Log::info('Batch notification result', ['notifications_created' => count($result)]);

        return $result[0] ?? null;
    }

    /**
     * Helper: Replace template variables in message
     *
     * @param string $message
     * @param array $variables - Key-value pairs like ['Project Code' => 'PRJ-123']
     * @return string
     */
    private static function replaceTemplateVariables(string $message, array $variables): string {
        foreach ($variables as $key => $value) {
            $message = str_replace("[$key]", $value, $message);
        }
        return $message;
    }

    /**
     * Generate URL that works in both development and production
     *
     * @param string $routeName
     * @param array $parameters
     * @return string
     */
    private static function generateUrl(string $routeName, array $parameters = []): string {
        // In development (when APP_ENV is local), use relative URLs
        if (config('app.env') === 'local' && config('app.debug')) {
            $path = route($routeName, $parameters, false); // false = relative URL
            return $path;
        }
        
        // In production, use absolute URLs
        return route($routeName, $parameters, true); // true = absolute URL
    }

    /**
     * Get unread notification count for a user
     *
     * @param int $userId
     * @return int
     */
    public static function getUnreadCount(int $userId): int {
        return Notification::forUser($userId)->unread()->count();
    }

    /**
     * Get user's notifications (paginated)
     *
     * @param int $userId
     * @param int $perPage
     * @return \Illuminate\Pagination\Paginator
     */
    public static function getUserNotifications(int $userId, int $perPage = 15) {
        return Notification::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get user's unread notifications
     *
     * @param int $userId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getUserUnreadNotifications(int $userId, int $limit = 10) {
        return Notification::forUser($userId)
            ->unread()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Mark user notification as read
     *
     * @param int $notificationId
     * @return bool
     */
    public static function markAsRead(int $notificationId): bool {
        try {
            $notification = Notification::findOrFail($notificationId);
            $notification->markAsRead();
            return true;
        } catch (\Exception $e) {
            Log::error('Error marking notification as read', [
                'notification_id' => $notificationId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Mark all user notifications as read
     *
     * @param int $userId
     * @return bool
     */
    public static function markAllAsRead(int $userId): bool {
        try {
            Notification::forUser($userId)->unread()->get()->each->markAsRead();
            return true;
        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Delete a notification
     *
     * @param int $notificationId
     * @return bool
     */
    public static function delete(int $notificationId): bool {
        try {
            Notification::destroy($notificationId);
            return true;
        } catch (\Exception $e) {
            Log::error('Error deleting notification', [
                'notification_id' => $notificationId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Delete all read notifications for a user
     *
     * @param int $userId
     * @return int - Number of deleted notifications
     */
    public static function deleteReadNotifications(int $userId): int {
        try {
            return Notification::forUser($userId)->read()->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting read notifications', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }
}
