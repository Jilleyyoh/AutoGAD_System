<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ScoreInterpretation;

class ScoreInterpretationSeeder extends Seeder
{
    public function run(): void
    {
        $interpretations = [
            [
                'score_min'      => 0.00,
                'score_max'      => 49.99,
                'interpretation' => 'Poor',
                'description'    => 'The project does not meet the minimum standards. Major revisions or rejection is recommended.',
                'version'        => '1.0',
            ],
            [
                'score_min'      => 50.00,
                'score_max'      => 64.99,
                'interpretation' => 'Fair',
                'description'    => 'The project partially meets the standards. Significant improvements are needed before approval.',
                'version'        => '1.0',
            ],
            [
                'score_min'      => 65.00,
                'score_max'      => 74.99,
                'interpretation' => 'Satisfactory',
                'description'    => 'The project meets most of the required standards. Minor revisions may be requested.',
                'version'        => '1.0',
            ],
            [
                'score_min'      => 75.00,
                'score_max'      => 84.99,
                'interpretation' => 'Good',
                'description'    => 'The project meets the required standards well. It is recommended for approval with minimal conditions.',
                'version'        => '1.0',
            ],
            [
                'score_min'      => 85.00,
                'score_max'      => 100.00,
                'interpretation' => 'Excellent',
                'description'    => 'The project exceeds expectations and fully complies with all standards. Highly recommended for approval.',
                'version'        => '1.0',
            ],
        ];

        foreach ($interpretations as $data) {
            ScoreInterpretation::firstOrCreate(
                ['interpretation' => $data['interpretation'], 'version' => $data['version']],
                $data
            );
        }

        $this->command->info('✅ Score interpretations seeded successfully');
    }
}
