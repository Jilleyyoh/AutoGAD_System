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
        Schema::table('certificates', function (Blueprint $table) {
            // Add certificate_number if it doesn't exist
            if (!Schema::hasColumn('certificates', 'certificate_number')) {
                $table->string('certificate_number')->nullable()->after('certificate_code');
            }
            
            // Add issued_by if it doesn't exist
            if (!Schema::hasColumn('certificates', 'issued_by')) {
                $table->unsignedBigInteger('issued_by')->nullable()->after('approved_by');
                $table->foreign('issued_by')->references('id')->on('users')->onDelete('set null');
            }
            
            // Add issued_date if it doesn't exist
            if (!Schema::hasColumn('certificates', 'issued_date')) {
                $table->dateTime('issued_date')->nullable()->after('issue_date');
            }
            
            // Add remarks if it doesn't exist
            if (!Schema::hasColumn('certificates', 'remarks')) {
                $table->text('remarks')->nullable()->after('file_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            // Drop foreign key if it exists
            if (Schema::hasColumn('certificates', 'issued_by')) {
                $table->dropForeign(['issued_by']);
            }
            
            // Drop columns
            $table->dropColumn([
                'certificate_number',
                'issued_by',
                'issued_date',
                'remarks'
            ]);
        });
    }
};
