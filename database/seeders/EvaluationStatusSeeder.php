<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EvaluationStatus;

class EvaluationStatusSeeder extends Seeder
{
    public function run(): void
    {
        // Align statuses with Proponent "Track Submissions" filters:
        // Standard evaluation lifecycle statuses
        // IDs arranged consecutively: 1-7 for easy validation and maintenance
        $statuses = [
            'for_evaluation', // ID: 1 - when not yet assigned or after reassignment
            'revision',       // ID: 2 - when evaluator requests revision
            'approved',       // ID: 3 - replaces 'completed' - evaluator approved the project
            'declined',       // ID: 4 - evaluator declined
            'for_certification', // ID: 5 - waiting for certificate generation (NEW - added for consistency)
            'review',         // ID: 6 - Admin2 returned for evaluator review - awaiting re-evaluation
            'certified',      // ID: 7 - after Admin2 generates certificate
        ];

        foreach ($statuses as $status) {
            EvaluationStatus::firstOrCreate(['name' => $status]);
        }
    }
}
