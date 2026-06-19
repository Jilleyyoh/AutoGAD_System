<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Proponent;
use App\Models\Evaluator;
use App\Models\DomainExpertise;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $proponentRole  = Role::where('name', 'proponent')->first();
        $evaluatorRole  = Role::where('name', 'evaluator')->first();

        if (!$proponentRole || !$evaluatorRole) {
            $this->command->warn('⚠️  Roles not found. Run RoleSeeder first.');
            return;
        }

        // ── Proponent Users ──────────────────────────────────────────
        $proponents = [
            [
                'name'           => 'Maria Santos',
                'email'          => 'maria.santos@example.com',
                'birthdate'      => '1990-03-15',
                'contact_number' => '09171234567',
                'organization'   => 'Mindanao State University',
                'position'       => 'Research Faculty',
            ],
            [
                'name'           => 'Juan dela Cruz',
                'email'          => 'juan.delacruz@example.com',
                'birthdate'      => '1985-07-22',
                'contact_number' => '09281234568',
                'organization'   => 'University of the Philippines',
                'position'       => 'Associate Professor',
            ],
            [
                'name'           => 'Ana Reyes',
                'email'          => 'ana.reyes@example.com',
                'birthdate'      => '1993-11-08',
                'contact_number' => '09391234569',
                'organization'   => 'De La Salle University',
                'position'       => 'Research Assistant',
            ],
            [
                'name'           => 'Carlos Mendoza',
                'email'          => 'carlos.mendoza@example.com',
                'birthdate'      => '1988-05-30',
                'contact_number' => '09501234570',
                'organization'   => 'Ateneo de Manila University',
                'position'       => 'Senior Researcher',
            ],
            [
                'name'           => 'Liza Bautista',
                'email'          => 'liza.bautista@example.com',
                'birthdate'      => '1995-09-12',
                'contact_number' => '09611234571',
                'organization'   => 'Central Luzon State University',
                'position'       => 'Graduate Research Scholar',
            ],
        ];

        foreach ($proponents as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'           => $data['name'],
                    'password'       => Hash::make('password123'),
                    'role_id'        => $proponentRole->id,
                    'birthdate'      => $data['birthdate'],
                    'contact_number' => $data['contact_number'],
                    'email_verified_at' => now(),
                ]
            );

            Proponent::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'organization'   => $data['organization'],
                    'position'       => $data['position'],
                    'contact_number' => $data['contact_number'],
                ]
            );
        }

        $this->command->info('✅ Proponent users seeded (5 users)');

        // ── Evaluator Users ──────────────────────────────────────────
        $domains = DomainExpertise::all()->keyBy('domain_name');

        $evaluators = [
            [
                'name'           => 'Dr. Roberto Lim',
                'email'          => 'roberto.lim@example.com',
                'birthdate'      => '1975-02-18',
                'contact_number' => '09721234572',
                'domain'         => 'Information and Communications Technology',
            ],
            [
                'name'           => 'Dr. Elena Torres',
                'email'          => 'elena.torres@example.com',
                'birthdate'      => '1978-06-05',
                'contact_number' => '09831234573',
                'domain'         => 'Health and Biomedical Sciences',
            ],
            [
                'name'           => 'Prof. Michael Aquino',
                'email'          => 'michael.aquino@example.com',
                'birthdate'      => '1972-10-25',
                'contact_number' => '09941234574',
                'domain'         => 'Engineering and Technology',
            ],
            [
                'name'           => 'Dr. Grace Villanueva',
                'email'          => 'grace.villanueva@example.com',
                'birthdate'      => '1980-04-14',
                'contact_number' => '09051234575',
                'domain'         => 'Agriculture and Natural Resources',
            ],
            [
                'name'           => 'Prof. Jose Fernandez',
                'email'          => 'jose.fernandez@example.com',
                'birthdate'      => '1969-12-01',
                'contact_number' => '09161234576',
                'domain'         => 'Education and Pedagogy',
            ],
        ];

        foreach ($evaluators as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'           => $data['name'],
                    'password'       => Hash::make('password123'),
                    'role_id'        => $evaluatorRole->id,
                    'birthdate'      => $data['birthdate'],
                    'contact_number' => $data['contact_number'],
                    'email_verified_at' => now(),
                ]
            );

            $domain = $domains->get($data['domain']);

            Evaluator::updateOrCreate(
                ['user_id' => $user->id],
                ['domain_expertise_id' => $domain?->id]
            );
        }

        $this->command->info('✅ Evaluator users seeded (5 users)');
    }
}
