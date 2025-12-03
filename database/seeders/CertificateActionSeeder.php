<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CertificateAction;

class CertificateActionSeeder extends Seeder
{
    public function run(): void
    {
        $actions = ['submitted', 'approved', 'declined', 'revoked'];

        foreach ($actions as $action) {
            CertificateAction::firstOrCreate(['name' => $action]);
        }
    }
}
