<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ScoreInterpretationSeeder extends Seeder
{
    public function run(): void
    {
        // No sample data - Admin 1 will create score interpretations through the interface
        $this->command->info('✅ Score interpretations seeder ready (no sample data)');
    }
}
