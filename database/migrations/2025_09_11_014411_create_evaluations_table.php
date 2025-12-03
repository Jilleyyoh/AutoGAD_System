<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('evaluator_id')->constrained()->onDelete('cascade');
            $table->decimal('total_score', 5, 2)->default(0.00);
            $table->foreignId('interpretation_id')->nullable()->constrained('score_interpretations')->nullOnDelete();
            $table->foreignId('status_id')->default(1)->constrained('evaluation_statuses'); // default: pending
            $table->timestamp('submission_date')->nullable();
            $table->timestamp('completion_date')->nullable();
            $table->text('comments')->nullable();
            $table->text('final_remarks')->nullable()->comment('Final remarks entered by evaluator');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
