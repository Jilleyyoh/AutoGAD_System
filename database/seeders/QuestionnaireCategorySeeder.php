<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireItem;

class QuestionnaireCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'category_name' => 'Relevance and Significance',
                'description'   => 'Assesses how well the project addresses a genuine need or gap and its overall importance to the target sector.',
                'max_score'     => 20.00,
                'display_order' => 1,
                'is_active'     => true,
                'version'       => '1.0',
                'items' => [
                    [
                        'item_number'   => 1,
                        'question'      => 'Does the project address a clearly identified and significant problem or need?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 1,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 2,
                        'question'      => 'Is the project aligned with national, regional, or institutional development priorities?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 2,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 3,
                        'question'      => 'Are the beneficiaries of the project clearly identified and well-defined?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 3,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 4,
                        'question'      => 'Does the project demonstrate novelty or innovation in its approach?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 4,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                ],
            ],
            [
                'category_name' => 'Objectives and Expected Outcomes',
                'description'   => 'Evaluates the clarity, achievability, and measurability of the project\'s stated goals and deliverables.',
                'max_score'     => 20.00,
                'display_order' => 2,
                'is_active'     => true,
                'version'       => '1.0',
                'items' => [
                    [
                        'item_number'   => 5,
                        'question'      => 'Are the project objectives specific, measurable, achievable, relevant, and time-bound (SMART)?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 1,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 6,
                        'question'      => 'Are the expected outputs and outcomes clearly described and realistic?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 2,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 7,
                        'question'      => 'Does the project include measurable indicators to assess success?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 3,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 8,
                        'question'      => 'Is there a clear logical framework (logframe) or results chain linking activities to outcomes?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 4,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                ],
            ],
            [
                'category_name' => 'Methodology and Work Plan',
                'description'   => 'Reviews the soundness of the research design, methods, and the feasibility of the project timeline.',
                'max_score'     => 25.00,
                'display_order' => 3,
                'is_active'     => true,
                'version'       => '1.0',
                'items' => [
                    [
                        'item_number'   => 9,
                        'question'      => 'Is the methodology appropriate for achieving the project objectives?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 1,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 10,
                        'question'      => 'Is the data collection and analysis plan clearly described and scientifically sound?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 2,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 11,
                        'question'      => 'Is the timeline realistic and well-structured with clear milestones?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 3,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 12,
                        'question'      => 'Are ethical considerations and risk mitigation strategies adequately addressed?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 4,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 13,
                        'question'      => 'Does the work plan clearly assign responsibilities and accountabilities to team members?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 5,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                ],
            ],
            [
                'category_name' => 'Budget and Resources',
                'description'   => 'Assesses whether the requested budget is justified, reasonable, and aligned with the project activities.',
                'max_score'     => 20.00,
                'display_order' => 4,
                'is_active'     => true,
                'version'       => '1.0',
                'items' => [
                    [
                        'item_number'   => 14,
                        'question'      => 'Is the budget breakdown detailed, complete, and properly justified?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 1,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 15,
                        'question'      => 'Is the total budget request reasonable relative to the project scope and outputs?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 2,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 16,
                        'question'      => 'Are the human resources (personnel) and their roles clearly defined and justified?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 3,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 17,
                        'question'      => 'Does the project utilize existing institutional resources to maximize cost-efficiency?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 4,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                ],
            ],
            [
                'category_name' => 'Sustainability and Impact',
                'description'   => 'Evaluates the long-term viability, scalability, and societal impact of the project beyond its funding period.',
                'max_score'     => 15.00,
                'display_order' => 5,
                'is_active'     => true,
                'version'       => '1.0',
                'items' => [
                    [
                        'item_number'   => 18,
                        'question'      => 'Does the project have a clear plan for sustainability after the funding period ends?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 1,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 19,
                        'question'      => 'Is there potential for scaling up or replicating the project in other contexts or regions?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 2,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                    [
                        'item_number'   => 20,
                        'question'      => 'Does the project contribute positively to gender equality and social inclusion?',
                        'score_options' => '0,1,2,3,4,5',
                        'max_score'     => 5.00,
                        'display_order' => 3,
                        'is_active'     => true,
                        'version'       => '1.0',
                    ],
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $items = $catData['items'];
            unset($catData['items']);

            $category = QuestionnaireCategory::updateOrCreate(
                ['category_name' => $catData['category_name'], 'version' => $catData['version']],
                $catData
            );

            foreach ($items as $itemData) {
                $itemData['category_id'] = $category->id;
                QuestionnaireItem::updateOrCreate(
                    [
                        'category_id'  => $category->id,
                        'item_number'  => $itemData['item_number'],
                        'version'      => $itemData['version'],
                    ],
                    $itemData
                );
            }
        }

        $this->command->info('✅ Questionnaire categories and items seeded (5 categories, 20 items)');
    }
}
