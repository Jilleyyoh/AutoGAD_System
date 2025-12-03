<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add max_score column to evaluations table
     * 
     * Stores the version-accurate maximum possible score for each evaluation.
     * This value is extracted from the bound questionnaire version snapshot
     * and locked at evaluation submission time to maintain version integrity.
     */
    public function up(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->decimal('max_score', 5, 2)->nullable()->after('total_score')
                ->comment('Version-accurate max score extracted from bound questionnaire version snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn('max_score');
        });
    }
};
