<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class Admin2Seeder extends Seeder
{
    public function run(): void
    {
        // Get the admin2 role that was seeded in RoleSeeder
        $adminRole = Role::where('name', 'admin2')->first();

        // Just in case role seeding wasn't run yet
        if (!$adminRole) {
            $this->command->warn('⚠️ Role "admin2" not found. Run RoleSeeder first.');
            return;
        }

        // Seed Admin 2 user
        User::updateOrCreate(
            ['email' => 'admin2@example.com'],
            [
                'name' => 'Admin Two',
                'password' => Hash::make('password123'),
                'role_id' => $adminRole->id,
            ]
        );
    }
}
