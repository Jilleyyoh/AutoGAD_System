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
        Schema::table('notifications', function (Blueprint $table) {
            // Expand message column for longer notification text
            if (Schema::hasColumn('notifications', 'message')) {
                $table->string('message', 500)->change();
            }

            // Expand link column for longer URLs
            if (Schema::hasColumn('notifications', 'link')) {
                $table->string('link', 500)->nullable()->change();
            }

            // Add action_url for parsed/constructed URL (optional for frontend)
            if (!Schema::hasColumn('notifications', 'action_url')) {
                $table->string('action_url', 500)->nullable()->after('link')->comment('Fully constructed URL for frontend redirect');
            }

            // Add index on user_id for faster queries
            if (!Schema::hasIndex('notifications', 'notifications_user_id_index')) {
                $table->index('user_id');
            }

            // Add index on type for filtering notifications
            if (!Schema::hasIndex('notifications', 'notifications_type_index')) {
                $table->index('type');
            }

            // Add index on read_at for querying unread notifications
            if (!Schema::hasIndex('notifications', 'notifications_read_at_index')) {
                $table->index('read_at');
            }

            // Add composite index for common queries (user + read status)
            if (!Schema::hasIndex('notifications', 'notifications_user_read_index')) {
                $table->index(['user_id', 'read_at']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Drop indices
            $table->dropIndex('notifications_user_id_index');
            $table->dropIndex('notifications_type_index');
            $table->dropIndex('notifications_read_at_index');
            $table->dropIndex('notifications_user_read_index');

            // Drop the action_url column
            if (Schema::hasColumn('notifications', 'action_url')) {
                $table->dropColumn('action_url');
            }

            // Revert message column to original size
            $table->string('message', 255)->change();

            // Revert link column to original size
            $table->string('link', 255)->nullable()->change();
        });
    }
};
