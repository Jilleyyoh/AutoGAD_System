<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_scores', function (Blueprint $table) {
            $table->dropForeign(['questionnaire_item_id']);
        });

        Schema::table('evaluation_scores', function (Blueprint $table) {
            $table->foreign('questionnaire_item_id')
                ->references('id')
                ->on('questionnaire_items')
                ->onDelete('restrict'); // Prevent deleting items that have historical scores
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_scores', function (Blueprint $table) {
            $table->dropForeign(['questionnaire_item_id']);
        });

        Schema::table('evaluation_scores', function (Blueprint $table) {
            $table->foreign('questionnaire_item_id')
                ->references('id')
                ->on('questionnaire_items')
                ->onDelete('cascade');
        });
    }
};