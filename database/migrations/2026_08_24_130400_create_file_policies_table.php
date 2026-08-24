<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_policies', function (Blueprint $table) {
            $table->id();
            $table->string('context_code')->unique();    // PERMOHONAN_SOKONGAN, PROFIL_GAMBAR
            $table->string('label_ms');
            $table->string('label_en');
            $table->jsonb('allowed_extensions');         // GP-11 requires at least 3
            $table->jsonb('allowed_mimes');
            $table->unsignedInteger('max_size_kb')->default(5120);
            $table->unsignedSmallInteger('max_files')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_policies');
    }
};
