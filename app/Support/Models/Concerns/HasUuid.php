<?php

declare(strict_types=1);

namespace App\Support\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

/**
 * Gives a model a public-facing UUID.
 *
 * Sequential ids leak record counts and let anyone walk the table by editing a
 * URL, so nothing user-facing ever routes by `id`. See docs/04-data-model.md §13.
 */
trait HasUuid
{
    public static function bootHasUuid(): void
    {
        static::creating(function ($model): void {
            if (blank($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function scopeWhereUuid(Builder $query, string $uuid): Builder
    {
        return $query->where('uuid', $uuid);
    }
}
