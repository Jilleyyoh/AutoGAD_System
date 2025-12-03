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
        Schema::create('score_interpretations', function (Blueprint $table) {
            $table->id();
            $table->decimal('score_min', 5, 2);
            $table->decimal('score_max', 5, 2);
            $table->text('interpretation');
            $table->text('description')->nullable();
            $table->string('version', 10)->default('1.0');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('score_interpretations');
    }
};
