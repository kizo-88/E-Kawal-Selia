<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // GP-16: per-user AND per-role control. Exactly one of user_id / role_id is set.
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('role_id')->nullable();
            $table->string('category');
            $table->string('channel');
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'category']);
            $table->index(['role_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
