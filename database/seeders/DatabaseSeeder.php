<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // ── Lookup / reference tables ──────────────────────────────
            RoleSeeder::class,
            ScoreInterpretationSeeder::class,       // ← now has real data
            DomainExpertiseSeeder::class,           // ← now has real data
            ImplementationPhaseSeeder::class,
            ProjectStatusSeeder::class,
            ProjectDocumentTypeSeeder::class,
            EvaluationStatusSeeder::class,
            CertificateStatusSeeder::class,
            CertificateActionSeeder::class,
            AssignmentStatusSeeder::class,
            ContactMessageStatusSeeder::class,

            // ── Questionnaire (must come before version) ──────────────
            QuestionnaireSettingSeeder::class,
            QuestionnaireCategorySeeder::class,     // ← seeds categories AND items
            QuestionnaireItemSeeder::class,         // ← delegates to above
            QuestionnaireVersionSeeder::class,      // ← NEW: seeds v1.0 with snapshot

            // ── Admin users ───────────────────────────────────────────
            AdminSeeder::class,
            Admin2Seeder::class,

            // ── Test users (proponents + evaluators) ──────────────────
            TestUsersSeeder::class,                 // ← NEW: 5 proponents + 5 evaluators

            // ── Sample projects ───────────────────────────────────────
            TestProjectsSeeder::class,              // ← NEW: 6 projects across all statuses
        ]);
    }
}
