<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix the foreign key constraints to use the correct domain_expertises table name
     */
    public function up(): void
    {
        // Fix evaluators table foreign key
        Schema::table('evaluators', function (Blueprint $table) {
            // Drop the existing foreign key
            $table->dropForeign(['domain_expertise_id']);
            
            // Add the correct foreign key
            $table->foreign('domain_expertise_id')
                  ->references('id')
                  ->on('domain_expertises')
                  ->onDelete('cascade');
        });
        
        // Fix projects table foreign key
        Schema::table('projects', function (Blueprint $table) {
            // Drop the existing foreign key
            $table->dropForeign(['domain_expertise_id']);
            
            // Add the correct foreign key
            $table->foreign('domain_expertise_id')
                  ->references('id')
                  ->on('domain_expertises');
        });
    }

    /**
     * Reverse the migrations.
     * Revert back to the original foreign key constraints
     */
    public function down(): void
    {
        // Revert evaluators table foreign key
        Schema::table('evaluators', function (Blueprint $table) {
            // Drop the corrected foreign key
            $table->dropForeign(['domain_expertise_id']);
            
            // Add back the original foreign key
            $table->foreign('domain_expertise_id')
                  ->references('id')
                  ->on('domain_expertise')
                  ->onDelete('cascade');
        });
        
        // Revert projects table foreign key
        Schema::table('projects', function (Blueprint $table) {
            // Drop the corrected foreign key
            $table->dropForeign(['domain_expertise_id']);
            
            // Add back the original foreign key
            $table->foreign('domain_expertise_id')
                  ->references('id')
                  ->on('domain_expertise');
        });
    }
};
