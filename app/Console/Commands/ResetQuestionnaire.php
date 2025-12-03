<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireItem;

class ResetQuestionnaire extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'questionnaire:reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset questionnaire categories and questions with new structure (max_score = 20, improved questions)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->line('========================================');
        $this->line('QUESTIONNAIRE RESET');
        $this->line('========================================');
        $this->newLine();

        $this->line('Step 1: Deleting existing categories and questions...');
        try {
            QuestionnaireItem::truncate();
            QuestionnaireCategory::truncate();
            $this->info('✓ Deleted all existing categories and questions');
            $this->newLine();
        } catch (\Exception $e) {
            $this->error('✗ Error deleting data: ' . $e->getMessage());
            return;
        }

        // Step 2: Create new categories
        $this->line('Step 2: Creating new categories with max_score = 20...');

        $categories = [
            [
                'name' => 'Responsiveness and Accountability',
                'description' => 'Measures how responsive and accountable the organization is to its stakeholders',
                'order' => 1,
            ],
            [
                'name' => 'Institutional Capacity',
                'description' => 'Evaluates the organization\'s capacity to deliver programs and services',
                'order' => 2,
            ],
            [
                'name' => 'Gender Equality and Social Inclusion',
                'description' => 'Assesses the organization\'s commitment to gender equality and social inclusion',
                'order' => 3,
            ],
        ];

        $categoryIds = [];
        try {
            foreach ($categories as $cat) {
                $category = QuestionnaireCategory::create([
                    'category_name' => $cat['name'],
                    'description' => $cat['description'],
                    'max_score' => 20,
                    'display_order' => $cat['order'],
                    'is_active' => true,
                    'version' => '1.0',
                ]);
                $categoryIds[$cat['order']] = $category->id;
                $this->info("✓ Created: {$cat['name']} (ID: {$category->id})");
            }
            $this->newLine();
        } catch (\Exception $e) {
            $this->error('✗ Error creating categories: ' . $e->getMessage());
            return;
        }

        // Step 3: Create questions for each category
        $this->line('Step 3: Creating 5 questions per category...');
        $this->newLine();

        $questionsData = [
            1 => [ // Responsiveness and Accountability
                [
                    'num' => 1,
                    'question' => 'Does the organization have documented feedback mechanisms for community complaints and suggestions?',
                ],
                [
                    'num' => 2,
                    'question' => 'Are community feedback and suggestions systematically analyzed and acted upon?',
                ],
                [
                    'num' => 3,
                    'question' => 'Does the organization conduct regular stakeholder consultations to inform decision-making?',
                ],
                [
                    'num' => 4,
                    'question' => 'Does the organization publish transparent reports on project activities and financial management?',
                ],
                [
                    'num' => 5,
                    'question' => 'Does the organization have a clear grievance mechanism and timely resolution procedures?',
                ],
            ],
            2 => [ // Institutional Capacity
                [
                    'num' => 1,
                    'question' => 'Does the organization have qualified and trained staff to implement programs effectively?',
                ],
                [
                    'num' => 2,
                    'question' => 'Are organizational systems (finance, M&E, HR) documented and functioning effectively?',
                ],
                [
                    'num' => 3,
                    'question' => 'Does the organization have adequate office and operational resources to support program delivery?',
                ],
                [
                    'num' => 4,
                    'question' => 'Does the organization actively build partnerships to strengthen institutional capacity?',
                ],
                [
                    'num' => 5,
                    'question' => 'Does the organization invest in staff training and professional development?',
                ],
            ],
            3 => [ // Gender Equality and Social Inclusion
                [
                    'num' => 1,
                    'question' => 'Does the organization have a documented gender equality policy and implementation strategy?',
                ],
                [
                    'num' => 2,
                    'question' => 'Are women adequately represented in leadership and decision-making positions?',
                ],
                [
                    'num' => 3,
                    'question' => 'Does the organization actively work to include marginalized and vulnerable groups in programs?',
                ],
                [
                    'num' => 4,
                    'question' => 'Are program outcomes tracked and reported by gender and social status?',
                ],
                [
                    'num' => 5,
                    'question' => 'Does the organization address specific barriers faced by women and vulnerable groups?',
                ],
            ],
        ];

        try {
            foreach ($questionsData as $categoryOrder => $questions) {
                $categoryId = $categoryIds[$categoryOrder];
                $this->line("Creating questions for Category {$categoryOrder}:");
                
                foreach ($questions as $q) {
                    $itemNumber = $categoryOrder . '.' . $q['num'];
                    $scoreOptions = '0,4,8,12,16,20'; // 5 options ranging from 0 to 20
                    
                    QuestionnaireItem::create([
                        'category_id' => $categoryId,
                        'item_number' => $itemNumber,
                        'question' => $q['question'],
                        'score_options' => $scoreOptions,
                        'max_score' => 4, // Each question is worth 4 points (5 questions × 4 = 20)
                        'display_order' => $q['num'],
                        'is_active' => true,
                        'version' => '1.0',
                    ]);
                    
                    $this->info("  ✓ {$itemNumber}: " . substr($q['question'], 0, 70) . '...');
                }
                $this->newLine();
            }
        } catch (\Exception $e) {
            $this->error('✗ Error creating questions: ' . $e->getMessage());
            return;
        }

        // Step 4: Verification
        $this->line('========================================');
        $this->line('VERIFICATION');
        $this->line('========================================');
        $this->newLine();

        $totalCategories = QuestionnaireCategory::count();
        $totalQuestions = QuestionnaireItem::count();

        $this->info("✓ Categories created: {$totalCategories}");
        $this->info("✓ Questions created: {$totalQuestions}");
        $this->newLine();

        // Show category details
        $categories = QuestionnaireCategory::with('items')->orderBy('display_order')->get();
        foreach ($categories as $cat) {
            $categoryTotal = $cat->items->sum('max_score');
            $this->line("Category: {$cat->category_name}");
            $this->line("  Max Score: {$cat->max_score}");
            $this->line("  Questions: {$cat->items->count()}");
            $this->line("  Sum of Question Max Scores: {$categoryTotal}");
            $this->line("  Questions:");
            
            foreach ($cat->items as $item) {
                $questionPreview = substr($item->question, 0, 60) . '...';
                $this->line("    {$item->item_number}: {$questionPreview} (max: {$item->max_score})");
            }
            $this->newLine();
        }

        $this->line('========================================');
        $this->info('✓ QUESTIONNAIRE RESET COMPLETE');
        $this->line('========================================');
        $this->newLine();
        
        $this->warn('IMPORTANT NEXT STEPS:');
        $this->line('1. Go to Admin 1 > Questionnaire Settings');
        $this->line('2. Click "Generate New Version" to create a snapshot');
        $this->line('3. This will create v2.0 with the updated questions');
        $this->line('4. Existing evaluations will use their locked versions');
        $this->line('5. NEW evaluations will use the updated questionnaire');
    }
}
