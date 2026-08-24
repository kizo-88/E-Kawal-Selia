<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('channel');     // inapp|email|sms
            $table->string('category');    // pendaftaran|permohonan|semakan|kelulusan|pemberitahuan
            $table->string('subject_ms')->nullable();
            $table->string('subject_en')->nullable();
            $table->longText('body_ms');
            $table->longText('body_en');
            $table->jsonb('variables')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
