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
        Schema::create('questionnaire_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key', 100);
            $table->text('setting_value');
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
        Schema::dropIfExists('questionnaire_settings');
    }
};
