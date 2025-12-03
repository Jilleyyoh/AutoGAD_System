<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'related_id',
        'link',
        'action_url',
        'read_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the user associated with this notification.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if notification is read.
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    /**
     * Check if notification is unread.
     */
    public function isUnread(): bool
    {
        return $this->read_at === null;
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): void
    {
        if ($this->isUnread()) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Mark notification as unread.
     */
    public function markAsUnread(): void
    {
        $this->update(['read_at' => null]);
    }

    /**
     * Get the URL for this notification redirect.
     * Safely handles missing parameters or invalid routes.
     */
    public function getRedirectUrl(): ?string
    {
        try {
            $currentUser = \Auth::user();
            
            // Generate URL based on notification type FIRST (more reliable than stored URLs)
            // Some types don't need related_id but should check user role
            switch ($this->type) {
                // Certificate notifications - route based on user role
                case 'certificate_generated':
                case 'certification_issued':
                    if ($currentUser) {
                        if ($currentUser->role_id === 3) {
                            // Admin1 user - redirect to assignments list with project highlight
                            return route('admin1.assignments.index', ['highlight' => $this->related_id]);
                        } elseif ($currentUser->role_id === 2) {
                            // Evaluator user - redirect to evaluator certificates
                            return route('evaluator.certificates.index');
                        } else {
                            // Proponent or others - redirect to certificates list
                            return route('proponent.certificates.index');
                        }
                    }
                    return route('proponent.certificates.index');
            }

            // Fallback: Generate URL based on notification type and related_id (for those that need it)
            if ($this->related_id) {
                $url = null;
                $currentUser = \Auth::user();
                
                switch ($this->type) {
                    // Project evaluation notifications - route based on user role
                    case 'project_assigned':
                    case 'project_assigned_revision':
                    case 'evaluation_completed_approved':
                    case 'evaluation_completed_declined':
                    case 'evaluation_completed_revision':
                        if ($currentUser && $currentUser->role_id === 2) {
                            // Evaluator user
                            $url = route('evaluator.evaluations.show', $this->related_id);
                        } elseif ($currentUser && $currentUser->role_id === 3) {
                            // Admin1 user - redirect to assignments list with project highlight
                            $url = route('admin1.assignments.index', ['highlight' => $this->related_id]);
                        } elseif ($currentUser && $currentUser->role_id === 1) {
                            // Proponent user - redirect to submission show page
                            $url = route('proponent.pap.submissions.show', $this->related_id);
                        }
                        break;
                        
                    // FOR CERTIFICATION status
                    case 'for_certification':
                        if ($currentUser && $currentUser->role_id === 1) {
                            // Proponent user - redirect to submissions with highlight
                            $url = route('proponent.pap.submissions', ['highlight' => $this->related_id]);
                        } elseif ($currentUser && $currentUser->role_id === 2) {
                            // Evaluator user - redirect to evaluations list with highlight
                            $url = route('evaluator.evaluations.index', ['highlight' => $this->related_id]);
                        } else {
                            // Admin1 user - redirect to assignments with highlight
                            $url = route('admin1.assignments.index', ['highlight' => $this->related_id]);
                        }
                        break;
                    
                    // IN REVIEW status
                    case 'in_review':
                        if ($currentUser && $currentUser->role_id === 1) {
                            // Proponent user - redirect to submissions with highlight
                            $url = route('proponent.pap.submissions', ['highlight' => $this->related_id]);
                        } elseif ($currentUser && $currentUser->role_id === 2) {
                            // Evaluator user - redirect to evaluations list with highlight
                            $url = route('evaluator.evaluations.index', ['highlight' => $this->related_id]);
                        } else {
                            // Admin1 user - redirect to assignments with highlight
                            $url = route('admin1.assignments.index', ['highlight' => $this->related_id]);
                        }
                        break;
                    
                    // CERTIFIED status
                    case 'certified':
                        if ($currentUser && $currentUser->role_id === 1) {
                            // Proponent user - redirect to certificates with highlight
                            $url = route('proponent.certificates.index', ['highlight' => $this->related_id]);
                        } elseif ($currentUser && $currentUser->role_id === 2) {
                            // Evaluator user - redirect to certificates with highlight
                            $url = route('evaluator.certificates.index', ['highlight' => $this->related_id]);
                        } else {
                            // Admin1 user - redirect to certificates with highlight
                            $url = route('admin1.certificates.index', ['highlight' => $this->related_id]);
                        }
                        break;
                    
                    // Legacy approved_for_certification and returned_for_review - map to new types
                    case 'approved_for_certification':
                    case 'returned_for_review':
                        if ($currentUser && $currentUser->role_id === 1) {
                            // Proponent user - redirect to track submissions with highlighting
                            $url = route('proponent.pap.submissions', ['highlight' => $this->related_id]);
                        } elseif ($currentUser && $currentUser->role_id === 2) {
                            // Evaluator user - redirect to their evaluations with project
                            $url = route('evaluator.evaluations.show', $this->related_id);
                        } else {
                            // Admin1 user
                            $url = route('admin1.assignments.index', ['highlight' => $this->related_id]);
                        }
                        break;
                    case 'project_submitted':
                    case 'project_revised':
                    case 'project_approved_by_evaluator':
                        $url = route('admin1.assignments.index', ['highlight' => $this->related_id]);
                        break;
                        
                    // Conversation/Message notifications
                    case 'message_received':
                    case 'message_replied':
                        // Route based on user role
                        $user = \Auth::user();
                        if ($user && $user->role_id === 4) {
                            // Admin2 user
                            $url = route('admin2.conversations.show', $this->related_id);
                        } else {
                            // Proponent or others
                            $url = route('proponent.conversations.show', $this->related_id);
                        }
                        break;

                    // Old/legacy notification types - redirect to submissions
                    case 'evaluation_status_change':
                    case 'project_evaluation_update':
                        $url = route('proponent.pap.submissions.show', $this->related_id);
                        break;
                }

                if ($url) {
                    \Log::debug('Generated URL', ['type' => $this->type, 'url' => $url]);
                    return $url;
                }
            }

            // Finally, use stored URLs as fallback (action_url is full URL)
            if ($this->action_url) {
                \Log::debug('Using action_url', ['url' => $this->action_url]);
                return $this->action_url;
            }
            
            // link is route name - don't use as URL fallback as it needs to be resolved
            // Log for debugging but don't use for redirect
            if ($this->link) {
                \Log::debug('Link available but not used for redirect (is route name)', ['link' => $this->link]);
            }

            \Log::debug('No redirect URL generated', [
                'type' => $this->type,
                'related_id' => $this->related_id,
                'has_related_id' => !empty($this->related_id),
            ]);
            return null;
        } catch (\Exception $e) {
            \Log::debug('Error generating redirect URL', [
                'notification_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Scope query to unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope query to read notifications.
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope query for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope query for a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
