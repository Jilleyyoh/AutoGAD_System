<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Get the role associated with the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
    
    /**
     * Get the proponent profile associated with the user.
     */
    public function proponent(): HasOne
    {
        return $this->hasOne(Proponent::class);
    }
    
    /**
     * Get the evaluator profile associated with the user.
     */
    public function evaluator(): HasOne
    {
        return $this->hasOne(Evaluator::class);
    }
    
    /**
     * Get the notifications associated with the user.
     */
    public function userNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'recipient_id');
    }
    
    /**
     * Get the projects approved by this user.
     */
    public function approvedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'approved_by');
    }
    
    /**
     * Get the conversations associated with the user.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
    
    /**
     * Get the system logs created by this user.
     */
    public function systemLogs(): HasMany
    {
        return $this->hasMany(SystemLog::class, 'user_id');
    }
    
    /**
     * Check if the user has a specific role.
     *
     * @param string $roleName
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role->name === $roleName;
    }
}
