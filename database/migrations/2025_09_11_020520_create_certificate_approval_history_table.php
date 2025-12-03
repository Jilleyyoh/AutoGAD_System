<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_approval_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('certificate_id')->constrained('certificates')->onDelete('cascade');
            $table->foreignId('action_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('action_type_id')->constrained('certificate_actions'); // FK instead of enum
            $table->timestamp('action_date')->useCurrent();
            $table->text('comments')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_approval_history');
    }
};
