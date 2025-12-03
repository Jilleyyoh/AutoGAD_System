<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ImplementationPhase;

class ImplementationPhaseSeeder extends Seeder
{
    public function run(): void
    {
        $phases = ['planning', 'implementation', 'monitoring', 'evaluation'];

        foreach ($phases as $phase) {
            ImplementationPhase::firstOrCreate(['name' => $phase]);
        }
    }
}
