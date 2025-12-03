<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateApprovalHistory extends Model
{
    /** @use HasFactory<\Database\Factories\CertificateApprovalHistoryFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'certificate_id',
        'action_by',
        'action_type_id',
        'action_date',
        'comments',
    ];
    
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'action_date' => 'datetime',
    ];
    
    /**
     * Get the certificate associated with this approval history record.
     */
    public function certificate(): BelongsTo
    {
        return $this->belongsTo(Certificate::class);
    }
    
    /**
     * Get the user who performed this action.
     */
    public function actionBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'action_by');
    }
    
    /**
     * Get the action type for this history record.
     */
    public function actionType(): BelongsTo
    {
        return $this->belongsTo(CertificateAction::class, 'action_type_id');
    }
}
