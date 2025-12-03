<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Get the admin1 role that was seeded in RoleSeeder
        $adminRole = Role::where('name', 'admin1')->first();

        // Just in case role seeding wasn't run yet
        if (!$adminRole) {
            $this->command->warn('⚠️ Role "admin1" not found. Run RoleSeeder first.');
            return;
        }

        // Seed Admin 1 user
        User::updateOrCreate(
            ['email' => 'admin1@example.com'],
            [
                'name' => 'Admin One',
                'password' => Hash::make('password123'), // change later for security!
                'role_id' => $adminRole->id, // ✅ assign correct role
            ]
        );
    }
}
