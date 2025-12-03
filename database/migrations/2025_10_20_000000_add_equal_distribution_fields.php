<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add equal_distribution_enabled column to questionnaire_categories
        Schema::table('questionnaire_categories', function (Blueprint $table) {
            $table->boolean('equal_distribution_enabled')->default(false)->after('is_active');
        });

        // Modify questionnaire_items to support higher precision
        Schema::table('questionnaire_items', function (Blueprint $table) {
            // Drop the old max_score column and recreate with higher precision
            $table->dropColumn('max_score');
            // Add with DECIMAL(18,8) for higher precision
            $table->decimal('max_score', 18, 8)->default(1.00)->after('score_options');
            // Add flag to track if this question uses equal distribution
            $table->boolean('use_equal_distribution')->default(false)->after('max_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questionnaire_items', function (Blueprint $table) {
            $table->dropColumn('use_equal_distribution');
            $table->dropColumn('max_score');
            $table->decimal('max_score', 5, 2)->default(1.00)->after('score_options');
        });

        Schema::table('questionnaire_categories', function (Blueprint $table) {
            $table->dropColumn('equal_distribution_enabled');
        });
    }
};
