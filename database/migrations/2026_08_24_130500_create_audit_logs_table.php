<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // GP-18 / X-R01. No soft delete: rows leave only via the retention purge,
        // which is itself recorded in audit_purge_runs.
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name_snapshot')->nullable();   // ADR 0003
            $table->string('user_role_snapshot')->nullable();

            $table->string('action_code');                      // PERMOHONAN_DILULUSKAN, never 'update'
            $table->text('action_label_ms');                    // full human sentence (G3)
            $table->text('action_label_en');

            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->string('reference_no')->nullable();         // LPK/LPS/2026/00123
            $table->string('workflow_stage_code')->nullable();
            $table->string('module_code')->nullable();
            $table->string('page_code')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();

            $table->timestamp('created_at')->index();

            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['module_code', 'created_at']);
            $table->index('reference_no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
