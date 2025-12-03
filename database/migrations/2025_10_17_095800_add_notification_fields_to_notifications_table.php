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
            // Add title if it doesn't exist
            if (!Schema::hasColumn('notifications', 'title')) {
                $table->string('title')->nullable()->after('user_id');
            }
            
            // Add type if it doesn't exist
            if (!Schema::hasColumn('notifications', 'type')) {
                $table->string('type')->default('general')->after('message');
            }
            
            // Add related_id if it doesn't exist
            if (!Schema::hasColumn('notifications', 'related_id')) {
                $table->unsignedBigInteger('related_id')->nullable()->after('type');
            }
            
            // Add read_at if it doesn't exist (more explicit than is_read)
            if (!Schema::hasColumn('notifications', 'read_at')) {
                $table->dateTime('read_at')->nullable()->after('is_read');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn([
                'title',
                'type',
                'related_id',
                'read_at',
            ]);
        });
    }
};
