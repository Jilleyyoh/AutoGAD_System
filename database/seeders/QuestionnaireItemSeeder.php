<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class QuestionnaireItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // No sample data - Admin 1 will create questionnaire items through the interface
        $this->command->info('✅ Questionnaire items seeder ready (no sample data)');
    }
}
