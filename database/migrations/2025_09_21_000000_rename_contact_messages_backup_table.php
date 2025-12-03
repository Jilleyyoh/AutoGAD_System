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
        // Rename the table to match the migration file name
        // This is just a safety measure for future migrations
        Schema::rename('contact_messages_backup', 'contact_message_backups');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('contact_message_backups', 'contact_messages_backup');
    }
};