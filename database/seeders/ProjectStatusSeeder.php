<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProjectStatus;

class ProjectStatusSeeder extends Seeder
{
    public function run(): void
    {
        // Align statuses with admin and proponent workflows
        // Full project lifecycle from submission to certification
        // IDs arranged consecutively: 1-7 for easy validation and maintenance
        $statuses = [
            'for_evaluation',     // ID: 1 - Admin1 not yet assigned or after reassignment
            'revision',           // ID: 2 - evaluator requested revision
            'approved',           // ID: 3 - evaluator approved - ready for Admin2 review
            'declined',           // ID: 4 - evaluator declined
            'for_certification',  // ID: 5 - Admin2 approved - ready to generate certificate
            'review',             // ID: 6 - Admin2 returned for evaluator review - awaiting re-evaluation
            'certified',          // ID: 7 - Admin2 generated certificate - final status
        ];

        foreach ($statuses as $status) {
            ProjectStatus::firstOrCreate(['name' => $status]);
        }
    }
}
