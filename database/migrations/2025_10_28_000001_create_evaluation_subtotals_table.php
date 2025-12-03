<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create evaluation_subtotals table
 * 
 * Stores aggregated scores per questionnaire category for each evaluation.
 * This allows us to:
 * - Pre-calculate subtotals for performance
 * - Maintain historical subtotal data
 * - Generate category-level reports
 * - Provide audit trail of scoring decisions
 * 
 * Relationship: Each evaluation can have multiple subtotals (one per category)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Skip if table already exists (for development environments)
        if (Schema::hasTable('evaluation_subtotals')) {
            return;
        }

        Schema::create('evaluation_subtotals', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            $table->unsignedInteger('questionnaire_category_id');
            
            // Category metadata (denormalized for reporting)
            $table->string('category_name', 255);
            $table->text('category_description')->nullable();
            
            // Score data
            $table->decimal('max_score', 10, 2); // Max possible score for category
            $table->decimal('actual_score', 10, 2)->nullable(); // Actual score achieved
            $table->integer('question_count')->default(0); // Number of questions in category
            $table->decimal('score_percentage', 5, 2)->nullable(); // (actual_score / max_score) * 100
            
            // Audit trail
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for efficient queries
            $table->unique(['evaluation_id', 'questionnaire_category_id']);
            $table->index('questionnaire_category_id');
            $table->index('actual_score'); // For filtering/sorting by score
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_subtotals');
    }
};
