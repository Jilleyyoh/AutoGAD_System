<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_message_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique(); // unread, read, replied
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('contact_message_statuses');
        Schema::enableForeignKeyConstraints();
    }
};
