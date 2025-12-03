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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_code', 50)->unique();
            $table->string('project_title', 255);
            $table->text('rationale')->nullable();
            $table->text('objectives')->nullable();
            $table->text('project_description')->nullable();

            // Replacing enums with foreign keys
            $table->foreignId('implementation_phase_id')->constrained('implementation_phases');
            $table->foreignId('proponent_id')->constrained('proponents');
            $table->foreignId('domain_expertise_id')->constrained('domain_expertises');
            $table->foreignId('project_status_id')->constrained('project_statuses');
            $table->foreignId('evaluator_id')->nullable()->constrained('evaluators');
            $table->foreignId('approved_by')->nullable()->constrained('users'); // fixed

            $table->decimal('total_score', 8, 2)->default(0.00)
                ->comment('Total evaluation score');
            $table->text('remarks')->nullable()
                ->comment('Final remarks/feedback on project evaluation');
            $table->text('for_revision_remarks')->nullable()
                ->comment('Remarks explaining why a project needs revision');

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
