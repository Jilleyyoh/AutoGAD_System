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
        Schema::create('questionnaire_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                  ->constrained('questionnaire_categories')
                  ->onDelete('cascade');
            $table->string('item_number', 10);
            $table->text('question');
            $table->string('score_options', 255)->default('0,0.5,1.0');
            $table->decimal('max_score', 5, 2)->default(1.00);
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(1);
            $table->string('version', 10)->default('1.0');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questionnaire_items');
    }
};
