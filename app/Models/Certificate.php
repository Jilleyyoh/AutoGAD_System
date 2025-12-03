<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Certificate extends Model
{
    /** @use HasFactory<\Database\Factories\CertificateFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'certificate_code',
        'certificate_number',
        'project_id',
        'evaluation_id',
        'issued_by',
        'issued_date',
        'expiry_date',
        'status_id',
        'file_path',
        'remarks',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issued_date' => 'datetime',
        'expiry_date' => 'date',
    ];
    
    /**
     * Get the project associated with this certificate.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
    
    /**
     * Get the evaluation associated with this certificate.
     */
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }
    
    /**
     * Get the user who approved this certificate.
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
    
    /**
     * Get the status of this certificate.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(CertificateStatus::class, 'status_id');
    }
    
    /**
     * Get the approval history records for this certificate.
     */
    public function approvalHistory(): HasMany
    {
        return $this->hasMany(CertificateApprovalHistory::class);
    }
}
