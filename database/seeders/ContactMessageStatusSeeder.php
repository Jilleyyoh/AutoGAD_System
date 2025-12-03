<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContactMessageStatus;

class ContactMessageStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['unread', 'read', 'replied'];

        foreach ($statuses as $status) {
            ContactMessageStatus::firstOrCreate(['name' => $status]);
        }
    }
}
