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
            Schema::create('contact_messages_backup', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('proponent_id');
        $table->string('subject', 255);
        $table->text('message');
        $table->unsignedBigInteger('status_id')->default(1); // reference same statuses as contact_messages
        $table->timestamps();
        $table->text('reply')->nullable();
        $table->unsignedBigInteger('replied_by')->nullable();
        $table->timestamp('replied_at')->nullable();
        $table->unsignedBigInteger('parent_message_id')->nullable();

        // Foreign keys
        $table->foreign('proponent_id')->references('id')->on('proponents')->onDelete('cascade');
        $table->foreign('status_id')->references('id')->on('contact_message_statuses')->onDelete('cascade');
        $table->foreign('replied_by')->references('id')->on('users')->onDelete('set null');
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('contact_messages_backup');
        Schema::enableForeignKeyConstraints();
    }
};
