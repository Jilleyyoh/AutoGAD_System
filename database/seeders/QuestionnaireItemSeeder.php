<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class QuestionnaireItemSeeder extends Seeder
{
    /**
     * Items are seeded inside QuestionnaireCategorySeeder to keep them
     * together with their parent categories and maintain insertion order.
     */
    public function run(): void
    {
        $this->command->info('✅ Questionnaire items are seeded via QuestionnaireCategorySeeder');
    }
}
