<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CertificateStatus;

class CertificateStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['pending', 'approved', 'revoked', 'declined'];

        foreach ($statuses as $status) {
            CertificateStatus::firstOrCreate(['name' => $status]);
        }
    }
}
