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
        Schema::table('evaluations', function (Blueprint $table) {
            $table->datetime('consolidated_at')->nullable()->after('completion_date');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->decimal('consolidated_score', 5, 2)->nullable()->after('total_score');
            $table->text('admin2_remarks')->nullable()->after('for_revision_remarks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn('consolidated_at');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('consolidated_score');
            $table->dropColumn('admin2_remarks');
        });
    }
};
