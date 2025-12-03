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
        Schema::create('questionnaire_categories', function (Blueprint $table) {
            $table->id();
            $table->string('category_name', 255);
            $table->text('description')->nullable();
            $table->decimal('max_score', 5, 2);
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
        Schema::dropIfExists('questionnaire_categories');
    }
};
