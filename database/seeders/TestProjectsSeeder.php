<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\Proponent;
use App\Models\Evaluator;
use App\Models\ProjectStatus;
use App\Models\ImplementationPhase;
use App\Models\DomainExpertise;

class TestProjectsSeeder extends Seeder
{
    public function run(): void
    {
        $proponents = Proponent::with('user')->get();
        $evaluators = Evaluator::with('user', 'domainExpertise')->get();

        if ($proponents->isEmpty() || $evaluators->isEmpty()) {
            $this->command->warn('⚠️  No proponents or evaluators found. Run TestUsersSeeder first.');
            return;
        }

        $statuses       = ProjectStatus::all()->keyBy('name');
        $phases         = ImplementationPhase::all()->keyBy('name');
        $domains        = DomainExpertise::all()->keyBy('domain_name');

        $projects = [
            // Project 1 — for_evaluation (just submitted, awaiting assignment)
            [
                'project_code'          => 'PRJ-2025-001',
                'project_title'         => 'Smart Irrigation System for Rice Farms Using IoT Sensors',
                'project_description'   => 'This project proposes the development of a low-cost, solar-powered IoT-based irrigation management system for smallholder rice farmers in Regions III and IV-A. The system will use soil moisture sensors and weather API data to automate irrigation scheduling, reducing water waste by an estimated 40%.',
                'rationale'             => 'Smallholder rice farmers in the Philippines face chronic water shortages due to poor irrigation scheduling and climate variability. Inefficient irrigation contributes to over-extraction of groundwater and reduced crop yields. A smart, affordable irrigation system can directly address these issues.',
                'objectives'            => "1. Develop a functional IoT-based irrigation prototype suitable for smallholder farms.\n2. Validate the prototype in at least two pilot barangays in Nueva Ecija.\n3. Reduce average irrigation water usage by 35–40% among participating farmers.\n4. Document lessons learned and produce a replication guide.",
                'proponent'             => 'maria.santos@example.com',
                'domain'                => 'Agriculture and Natural Resources',
                'status'                => 'for_evaluation',
                'phase'                 => 'implementation',
                'evaluator'             => null,
                'total_score'           => null,
                'consolidated_score'    => null,
                'remarks'               => null,
            ],
            // Project 2 — for_evaluation (submitted, not yet assigned)
            [
                'project_code'          => 'PRJ-2025-002',
                'project_title'         => 'Mobile-Based Maternal Health Monitoring Application for Rural Barangays',
                'project_description'   => 'This project aims to develop and pilot a mobile health (mHealth) application designed for rural barangay health workers (BHWs) to monitor pregnant women and new mothers. The app will include prenatal tracking, danger sign alerts, and automated referral to rural health units.',
                'rationale'             => 'Maternal mortality remains disproportionately high in rural and geographically isolated barangays in the Philippines due to limited access to prenatal care and delayed emergency referrals. A BHW-centric mobile app can bridge this gap using existing mobile phone infrastructure.',
                'objectives'            => "1. Design and develop a BHW-friendly mobile application for maternal health monitoring.\n2. Deploy the application in 5 pilot barangays in Northern Mindanao.\n3. Improve maternal care access rate by at least 30% in pilot areas within 12 months.\n4. Train 50 BHWs on effective app usage.",
                'proponent'             => 'juan.delacruz@example.com',
                'domain'                => 'Health and Biomedical Sciences',
                'status'                => 'for_evaluation',
                'phase'                 => 'planning',
                'evaluator'             => null,
                'total_score'           => null,
                'consolidated_score'    => null,
                'remarks'               => null,
            ],
            // Project 3 — revision requested
            [
                'project_code'          => 'PRJ-2025-003',
                'project_title'         => 'Cybersecurity Awareness Training Program for Local Government Units',
                'project_description'   => 'This project will develop and deliver a comprehensive cybersecurity awareness and training program for employees of selected Local Government Units (LGUs) in the Cordillera Administrative Region. The program includes modules on phishing, data privacy, safe browsing, and incident response.',
                'rationale'             => 'LGUs are increasingly digitizing their services but lack formal cybersecurity training, making them vulnerable to cyberattacks and data breaches. The Republic Act 10173 (Data Privacy Act) mandates proper data handling, yet most LGU staff are unaware of basic cybersecurity protocols.',
                'objectives'            => "1. Develop a 5-module cybersecurity awareness curriculum tailored for LGU staff.\n2. Conduct training sessions for at least 200 LGU employees across 10 LGUs.\n3. Assess pre- and post-training cybersecurity competency using validated instruments.\n4. Produce a replicable training kit for wider rollout.",
                'proponent'             => 'ana.reyes@example.com',
                'domain'                => 'Information and Communications Technology',
                'status'                => 'revision',
                'phase'                 => 'planning',
                'evaluator'             => 'roberto.lim@example.com',
                'total_score'           => 61.00,
                'consolidated_score'    => null,
                'remarks'               => null,
                'for_revision_remarks'  => 'The methodology section lacks detail on assessment instrument validation. Please provide sample items of the pre/post test and describe the statistical analysis plan. Also, the budget justification for training materials is insufficient.',
            ],
            // Project 4 — approved (evaluator approved, pending Admin2)
            [
                'project_code'          => 'PRJ-2025-004',
                'project_title'         => 'Green Building Retrofit Assessment and Recommendations for State Universities',
                'project_description'   => 'This project will conduct an energy audit and green building retrofit assessment of five state universities in Luzon. The study will identify cost-effective retrofitting interventions (LED lighting, solar panels, rainwater harvesting) and produce a prioritized investment roadmap for each institution.',
                'rationale'             => 'State universities in the Philippines consume significant amounts of electricity, contributing to operational costs and carbon emissions. With rising energy costs and national sustainability mandates, green retrofitting offers measurable cost savings and environmental benefits.',
                'objectives'            => "1. Conduct baseline energy audits of 5 SUC campuses in Luzon.\n2. Identify and prioritize feasible green retrofitting interventions for each campus.\n3. Estimate energy savings, cost reduction, and carbon emission reduction per intervention.\n4. Produce a Green Building Retrofit Roadmap with investment payback analysis.",
                'proponent'             => 'carlos.mendoza@example.com',
                'domain'                => 'Engineering and Technology',
                'status'                => 'approved',
                'phase'                 => 'implementation',
                'evaluator'             => 'michael.aquino@example.com',
                'total_score'           => 82.00,
                'consolidated_score'    => null,
                'remarks'               => 'Project demonstrates strong technical merit and a clear implementation plan. The team has relevant expertise and prior experience in energy auditing. Recommended for approval.',
            ],
            // Project 5 — for_certification (Admin2 approved)
            [
                'project_code'          => 'PRJ-2025-005',
                'project_title'         => 'Community-Based Early Warning System for Flood-Prone Barangays in Eastern Visayas',
                'project_description'   => 'This project will establish community-based flood early warning systems (CB-FEWS) in six flood-prone barangays in Eastern Visayas. The system integrates low-cost river level sensors, community alert protocols, and mobile SMS notifications for rapid evacuation.',
                'rationale'             => 'Eastern Visayas is among the most typhoon-affected regions in the Philippines. Communities in low-lying areas face repeated flooding with minimal warning time. A community-managed early warning system empowers local residents and reduces disaster casualties.',
                'objectives'            => "1. Install and calibrate river level monitoring sensors in 6 barangays.\n2. Develop and test SMS-based alert protocols with local DRRM offices.\n3. Train 120 community volunteers as FEWS monitors.\n4. Conduct a simulation exercise to validate system response time.",
                'proponent'             => 'liza.bautista@example.com',
                'domain'                => 'Environment and Climate Change',
                'status'                => 'for_certification',
                'phase'                 => 'monitoring',
                'evaluator'             => 'elena.torres@example.com',
                'total_score'           => 88.00,
                'consolidated_score'    => 88.00,
                'remarks'               => 'Exceptional project with clear community benefit and strong stakeholder engagement plan. All technical specifications are sound. Highly recommended for full funding.',
                'admin2_remarks'        => 'Approved for certification. Project fully meets technical and administrative requirements. Certificate of merit to be issued.',
            ],
            // Project 6 — certified (fully complete)
            [
                'project_code'          => 'PRJ-2024-001',
                'project_title'         => 'Digital Literacy Enhancement Program for Out-of-School Youth in BARMM',
                'project_description'   => 'This completed project delivered a 3-month digital literacy curriculum to 500 out-of-school youth (OSY) in 8 municipalities of the Bangsamoro Autonomous Region in Muslim Mindanao (BARMM). Participants received training in basic computer operations, internet safety, and digital job-readiness skills.',
                'rationale'             => 'BARMM has one of the highest rates of out-of-school youth in the country. Lack of digital skills severely limits employment opportunities. Structured digital literacy programs can directly improve livelihood prospects for marginalized youth.',
                'objectives'            => "1. Design a culturally responsive 60-hour digital literacy curriculum for OSY.\n2. Train 500 OSY participants across 8 BARMM municipalities.\n3. Achieve a post-training digital competency pass rate of at least 80%.\n4. Link at least 100 graduates to employment or livelihood opportunities.",
                'proponent'             => 'maria.santos@example.com',
                'domain'                => 'Education and Pedagogy',
                'status'                => 'certified',
                'phase'                 => 'evaluation',
                'evaluator'             => 'jose.fernandez@example.com',
                'total_score'           => 91.00,
                'consolidated_score'    => 91.00,
                'remarks'               => 'Outstanding project with excellent community impact. All deliverables were met. 87% of trainees passed the competency assessment and 112 graduates were linked to employment.',
                'admin2_remarks'        => 'Certificate of Excellence awarded. This project serves as a model implementation for future digital inclusion initiatives.',
            ],
        ];

        foreach ($projects as $data) {
            // Resolve foreign keys
            $proponent = Proponent::whereHas('user', fn($q) => $q->where('email', $data['proponent']))->first();
            $domain    = $domains->get($data['domain']);
            $status    = $statuses->get($data['status']);
            $phase     = $phases->get($data['phase']);

            if (!$proponent || !$domain || !$status || !$phase) {
                $this->command->warn("⚠️  Skipping {$data['project_code']} — missing dependency.");
                continue;
            }

            $evaluatorId = null;
            if ($data['evaluator'] ?? null) {
                $ev = Evaluator::whereHas('user', fn($q) => $q->where('email', $data['evaluator']))->first();
                $evaluatorId = $ev?->id;
            }

            $payload = [
                'project_title'          => $data['project_title'],
                'project_description'    => $data['project_description'],
                'rationale'              => $data['rationale'],
                'objectives'             => $data['objectives'],
                'proponent_id'           => $proponent->id,
                'domain_expertise_id'    => $domain->id,
                'project_status_id'      => $status->id,
                'implementation_phase_id'=> $phase->id,
                'evaluator_id'           => $evaluatorId,
                'total_score'            => $data['total_score'] ?? 0.00,
                'consolidated_score'     => $data['consolidated_score'] ?? null,
                'remarks'                => $data['remarks'] ?? null,
                'for_revision_remarks'   => $data['for_revision_remarks'] ?? null,
                'admin2_remarks'         => $data['admin2_remarks'] ?? null,
            ];

            Project::updateOrCreate(
                ['project_code' => $data['project_code']],
                $payload
            );
        }

        $this->command->info('✅ Test projects seeded (6 projects across all statuses)');
    }
}
