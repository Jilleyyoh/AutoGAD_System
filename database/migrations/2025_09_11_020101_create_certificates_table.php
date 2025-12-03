<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_code', 20)->unique(); // renamed from certificate_id
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('issue_date')->useCurrent();
            $table->date('expiry_date')->nullable();
            $table->foreignId('status_id')->default(1)->constrained('certificate_statuses'); // FK instead of enum
            $table->string('file_path', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
