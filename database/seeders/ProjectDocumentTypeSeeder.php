<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProjectDocumentType;

class ProjectDocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'proposal',
            'memorandum',
            'manual',
            'supporting_document',
            'drive_link', // extra option for Google Drive/OneDrive/etc.
        ];

        foreach ($types as $type) {
            ProjectDocumentType::firstOrCreate(['name' => $type]);
        }
    }
}
