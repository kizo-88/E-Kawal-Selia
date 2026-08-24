<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_ms');
            $table->string('name_en');
            $table->string('type');            // lesen|permit|surat|borang|laporan
            $table->longText('header_html')->nullable();
            $table->longText('body_html');
            $table->longText('footer_html')->nullable();
            $table->string('paper_size')->default('A4');
            $table->string('orientation')->default('portrait');
            $table->text('disclaimer_ms')->nullable();      // GP-13
            $table->text('disclaimer_en')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->string('min_access_level')->nullable(); // GP-13 confidentiality filter
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
    }
};
