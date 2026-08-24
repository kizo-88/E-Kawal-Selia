<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_internal_unit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('internal_unit_id')->constrained()->cascadeOnDelete();
            $table->string('position')->nullable();
            $table->boolean('is_head')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'internal_unit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_internal_unit');
    }
};
