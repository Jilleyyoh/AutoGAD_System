<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuestionnaireVersion;
use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireItem;
use App\Models\QuestionnaireSetting;

class QuestionnaireVersionSeeder extends Seeder
{
    public function run(): void
    {
        // Build the snapshot from the seeded categories and items
        $categories = QuestionnaireCategory::with('items')->where('version', '1.0')->get();

        $snapshot = [
            'categories' => [],
            'questions'  => [],
        ];

        foreach ($categories as $cat) {
            $snapshot['categories'][] = [
                'id'            => $cat->id,
                'category_name' => $cat->category_name,
                'description'   => $cat->description,
                'max_score'     => $cat->max_score,
                'display_order' => $cat->display_order,
            ];

            foreach ($cat->items as $item) {
                $snapshot['questions'][] = [
                    'id'            => $item->id,
                    'category_id'   => $item->category_id,
                    'item_number'   => $item->item_number,
                    'question'      => $item->question,
                    'score_options' => $item->score_options,
                    'max_score'     => $item->max_score,
                    'display_order' => $item->display_order,
                ];
            }
        }

        // Get the total max score (100.00 across all categories)
        $totalMax = $categories->sum('max_score');

        QuestionnaireVersion::updateOrCreate(
            ['version_number' => '1.0'],
            [
                'description'  => 'Initial version of the GAD Research Project Evaluation Questionnaire covering relevance, objectives, methodology, budget, and sustainability.',
                'is_active'    => true,
                'status'       => 'active',
                'snapshot'     => $snapshot,
                'passing_score' => 65.00,
                'archived_at'  => null,
            ]
        );

        // Also update the QuestionnaireSetting with the passing score
        QuestionnaireSetting::updateOrCreate(
            ['setting_key' => 'passing_score'],
            [
                'setting_value' => '65.00',
                'description'   => 'Minimum score required to pass evaluation',
                'version'       => '1.0',
            ]
        );

        $this->command->info("✅ Questionnaire version 1.0 seeded (total max score: {$totalMax})");
    }
}
