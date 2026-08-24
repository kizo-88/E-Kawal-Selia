<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_units', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_ms');
            $table->string('name_en');
            $table->foreignId('parent_id')->nullable()->constrained('internal_units')->nullOnDelete();
            $table->integer('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_units');
    }
};
