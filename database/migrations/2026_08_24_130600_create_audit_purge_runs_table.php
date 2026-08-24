<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_purge_runs', function (Blueprint $table) {
            $table->id();
            $table->timestamp('purged_before');
            $table->unsignedBigInteger('rows_deleted');
            $table->string('triggered_by');   // manual|schedule
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name_snapshot')->nullable();
            $table->timestamp('run_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_purge_runs');
    }
};
