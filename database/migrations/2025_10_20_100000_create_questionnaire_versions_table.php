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
        // Create questionnaire_versions table to track version history
        Schema::create('questionnaire_versions', function (Blueprint $table) {
            $table->id();
            $table->string('version_number')->unique(); // e.g., "1.0", "2.0"
            $table->text('description')->nullable(); // Description of what changed in this version
            $table->boolean('is_active')->default(true); // Only one version is active at a time
            $table->string('status')->default('active'); // active, archived, deprecated
            $table->longText('snapshot')->nullable(); // JSON snapshot of all categories and questions
            $table->integer('passing_score')->default(0); // Passing score threshold for this version
            $table->timestamp('archived_at')->nullable(); // When version was archived
            $table->timestamps();
            
            $table->index('version_number');
            $table->index('is_active');
            $table->index('status');
        });

        // Add version reference to evaluations table
        Schema::table('evaluations', function (Blueprint $table) {
            if (!Schema::hasColumn('evaluations', 'questionnaire_version_id')) {
                $table->unsignedBigInteger('questionnaire_version_id')->nullable()->after('proponent_id');
                $table->foreign('questionnaire_version_id')
                    ->references('id')
                    ->on('questionnaire_versions')
                    ->onDelete('restrict'); // Prevent deleting versions that have evaluations
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            if (Schema::hasColumn('evaluations', 'questionnaire_version_id')) {
                $table->dropForeign(['questionnaire_version_id']);
                $table->dropColumn('questionnaire_version_id');
            }
        });

        Schema::dropIfExists('questionnaire_versions');
    }
};
