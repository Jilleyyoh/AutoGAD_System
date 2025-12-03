<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['proponent', 'evaluator', 'admin1', 'admin2'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }
}

