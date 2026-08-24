<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('undertaking_versions', function (Blueprint $table) {
            $table->id();
            $table->string('version')->unique();
            $table->string('title_ms');
            $table->string('title_en');
            $table->longText('body_ms');
            $table->longText('body_en');
            $table->string('template_path')->nullable();   // GP-06 downloadable official form
            $table->date('effective_from');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('undertaking_versions');
    }
};
