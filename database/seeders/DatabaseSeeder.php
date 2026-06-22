<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ScoreInterpretationSeeder::class,
            DomainExpertiseSeeder::class,
            ImplementationPhaseSeeder::class,
            ProjectStatusSeeder::class, // 
            ProjectDocumentTypeSeeder::class,
            EvaluationStatusSeeder::class,
            CertificateStatusSeeder::class,
            CertificateActionSeeder::class,
            AssignmentStatusSeeder::class, // new
            ContactMessageStatusSeeder::class, // new
            QuestionnaireSettingSeeder::class, // new
            QuestionnaireCategorySeeder::class, // new
            QuestionnaireItemSeeder::class, // new
            AdminSeeder::class,
            Admin2Seeder::class,
        ]);
    }


}
