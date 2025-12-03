<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Remove equal_distribution_enabled from categories and use_equal_distribution from items
     * since equal distribution is now ALWAYS active (no optional flag)
     */
    public function up(): void
    {
        Schema::table('questionnaire_categories', function (Blueprint $table) {
            if (Schema::hasColumn('questionnaire_categories', 'equal_distribution_enabled')) {
                $table->dropColumn('equal_distribution_enabled');
            }
        });

        Schema::table('questionnaire_items', function (Blueprint $table) {
            if (Schema::hasColumn('questionnaire_items', 'use_equal_distribution')) {
                $table->dropColumn('use_equal_distribution');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questionnaire_categories', function (Blueprint $table) {
            $table->boolean('equal_distribution_enabled')->default(false)->after('is_active');
        });

        Schema::table('questionnaire_items', function (Blueprint $table) {
            $table->boolean('use_equal_distribution')->default(false)->after('max_score');
        });
    }
};
