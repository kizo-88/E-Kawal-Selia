<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lookup_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lookup_type_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('label_ms');
            $table->string('label_en');
            $table->integer('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->jsonb('metadata')->nullable();
            $table->string('created_via')->default('seed');   // seed|admin|change_request
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lookup_type_id', 'active', 'sort_order']);
        });

        // Unique per type, ignoring soft-deleted rows (ADR 0003).
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE UNIQUE INDEX lookup_values_type_code_unique
                ON lookup_values (lookup_type_id, code) WHERE deleted_at IS NULL');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lookup_values');
    }
};
