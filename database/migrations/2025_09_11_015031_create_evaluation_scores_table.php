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
        Schema::create('evaluation_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            $table->foreignId('questionnaire_item_id')->constrained('questionnaire_items')->onDelete('cascade');
            $table->decimal('score', 5, 2)->default(0.00);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['evaluation_id', 'questionnaire_item_id'], 'evaluation_item_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_scores');
    }
};
