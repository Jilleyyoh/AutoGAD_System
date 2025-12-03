<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuestionnaireSetting;

class QuestionnaireSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed only the essential default settings
        QuestionnaireSetting::updateOrCreate(
            ['setting_key' => 'questionnaire_version'],
            [
                'setting_value' => '1.0',
                'description' => 'Current questionnaire version',
                'version' => '1.0'
            ]
        );

        QuestionnaireSetting::updateOrCreate(
            ['setting_key' => 'passing_score'],
            [
                'setting_value' => '0.00',
                'description' => 'Minimum score required to pass evaluation (to be set by Admin 1)',
                'version' => '1.0'
            ]
        );

        $this->command->info('✅ Basic questionnaire settings seeded successfully');
    }
}
