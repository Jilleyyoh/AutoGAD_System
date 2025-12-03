<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_documents', function (Blueprint $table) {
            $table->id();

            // Reference project
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');

            // Reference document type
            $table->foreignId('document_type_id')->constrained('project_document_types');

            // File-based storage
            $table->string('file_path', 255)->nullable();
            $table->string('file_name', 255)->nullable();

            // Alternative: drive/external link
            $table->string('drive_link', 500)->nullable();

            $table->text('description')->nullable();
            $table->timestamp('upload_date')->useCurrent();

            // Optional: raw file content (if you want to store BLOB-like text)
            $table->longText('file_content')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_documents');
    }
};
