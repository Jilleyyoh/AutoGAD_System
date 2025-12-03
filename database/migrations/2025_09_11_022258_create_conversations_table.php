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
            Schema::create('conversations', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('proponent_id');
        $table->unsignedBigInteger('created_by'); // who initiated the conversation (could be user/admin)
        $table->string('subject', 255)->nullable();
        $table->timestamps();

        $table->foreign('proponent_id')->references('id')->on('proponents')->onDelete('cascade');
        $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
    });

        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('conversations');
        Schema::enableForeignKeyConstraints();
    }
};
