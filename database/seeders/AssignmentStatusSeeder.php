<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AssignmentStatus;

class AssignmentStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['assigned', 'reassigned', 'removed'];

        foreach ($statuses as $status) {
            AssignmentStatus::firstOrCreate(['name' => $status]);
        }
    }
}
