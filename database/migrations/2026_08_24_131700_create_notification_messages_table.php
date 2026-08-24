<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Delivery record for our own notification bus (CLAUDE.md section 6).
        // Deliberately NOT named `notifications`: that name belongs to Laravel's
        // DatabaseNotification table, which we do not use.
        Schema::create('notification_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('template_code')->nullable();
            $table->string('channel');
            $table->string('title');
            $table->text('body');
            $table->jsonb('data')->nullable();
            $table->string('reference_no')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->string('status')->default('queued');  // queued|sent|failed
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['status', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_messages');
    }
};
