<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class QuestionnaireCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // No sample data - Admin 1 will create categories through the interface
        $this->command->info('✅ Questionnaire categories seeder ready (no sample data)');
    }
}
