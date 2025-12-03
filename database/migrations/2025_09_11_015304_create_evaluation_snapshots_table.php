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
        Schema::create('evaluation_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            $table->longText('questionnaire_structure')->comment('JSON snapshot of questionnaire categories and items');
            $table->longText('evaluation_scores')->comment('JSON snapshot of evaluation scores and remarks');
            $table->longText('project_details')->comment('JSON snapshot of project information');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_snapshots');
    }
};
