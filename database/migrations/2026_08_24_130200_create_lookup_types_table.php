<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lookup_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();                       // SCREAMING_SNAKE, e.g. NEGERI
            $table->string('name_ms');
            $table->string('name_en');
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);           // blocks deletion
            $table->boolean('allow_user_request')->default(false);  // feeds GP-20 change requests
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lookup_types');
    }
};
