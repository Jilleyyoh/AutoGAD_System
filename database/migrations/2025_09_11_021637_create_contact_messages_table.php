<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proponent_id')->constrained('proponents')->onDelete('cascade');
            $table->string('subject', 255);
            $table->text('message');
            $table->foreignId('status_id')->constrained('contact_message_statuses')->default(1); // unread by default
            $table->timestamps();
            $table->text('reply')->nullable();
            $table->foreignId('replied_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('replied_at')->nullable();
            $table->foreignId('parent_message_id')->nullable()->constrained('contact_messages')->onDelete('cascade');
            $table->foreignId('conversation_id')->nullable()->constrained('conversations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('contact_messages');
        Schema::enableForeignKeyConstraints();
    }
};
