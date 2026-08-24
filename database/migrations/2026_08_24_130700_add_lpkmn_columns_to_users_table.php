<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->unique()->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->text('ic_no')->nullable()->after('phone');                   // encrypted cast
            $table->string('user_category')->default('external')->after('ic_no'); // internal|external
            $table->boolean('must_change_password')->default(true)->after('password');
            $table->text('mfa_secret')->nullable()->after('must_change_password'); // encrypted cast
            $table->timestamp('mfa_enabled_at')->nullable()->after('mfa_secret');
            $table->unsignedSmallInteger('failed_attempts')->default(0)->after('mfa_enabled_at');
            $table->timestamp('locked_until')->nullable()->after('failed_attempts');
            $table->string('status')->default('pending')->after('locked_until');  // pending|active|inactive|archived
            $table->string('profile_photo_path')->nullable()->after('status');
            $table->timestamp('last_login_at')->nullable()->after('profile_photo_path');
            $table->string('preferred_locale', 2)->default('ms')->after('last_login_at');
            $table->softDeletes();

            $table->index(['user_category', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['user_category', 'status']);
            $table->dropSoftDeletes();
            $table->dropColumn([
                'uuid', 'phone', 'ic_no', 'user_category', 'must_change_password',
                'mfa_secret', 'mfa_enabled_at', 'failed_attempts', 'locked_until',
                'status', 'profile_photo_path', 'last_login_at', 'preferred_locale',
            ]);
        });
    }
};
