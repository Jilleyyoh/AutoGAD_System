<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DomainExpertise;

class DomainExpertiseSeeder extends Seeder
{
    public function run(): void
    {
        $domains = [
            [
                'domain_name' => 'Agriculture and Natural Resources',
                'description' => 'Projects related to farming, forestry, fisheries, and natural resource management.',
            ],
            [
                'domain_name' => 'Health and Biomedical Sciences',
                'description' => 'Projects focused on public health, medical research, and biomedical innovations.',
            ],
            [
                'domain_name' => 'Information and Communications Technology',
                'description' => 'Projects involving software, hardware, networking, and digital systems.',
            ],
            [
                'domain_name' => 'Engineering and Technology',
                'description' => 'Projects in civil, mechanical, electrical, and industrial engineering.',
            ],
            [
                'domain_name' => 'Social and Behavioral Sciences',
                'description' => 'Projects addressing community development, psychology, and societal issues.',
            ],
            [
                'domain_name' => 'Education and Pedagogy',
                'description' => 'Projects aimed at improving teaching, learning, and educational systems.',
            ],
            [
                'domain_name' => 'Environment and Climate Change',
                'description' => 'Projects focused on environmental conservation, sustainability, and climate adaptation.',
            ],
            [
                'domain_name' => 'Business and Economics',
                'description' => 'Projects related to enterprise development, economic policy, and business innovation.',
            ],
        ];

        foreach ($domains as $domain) {
            DomainExpertise::firstOrCreate(
                ['domain_name' => $domain['domain_name']],
                ['description' => $domain['description']]
            );
        }

        $this->command->info('✅ Domain expertise seeded successfully');
    }
}
