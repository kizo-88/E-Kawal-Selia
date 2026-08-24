<?php

declare(strict_types=1);

namespace App\Support\Models\Concerns;

use Illuminate\Database\Eloquent\Model;

/**
 * Copies a related record's human-readable identity onto this row as text.
 *
 * ADR 0003: historical records must stay legible after the thing they point at
 * is soft-deleted or renamed. The foreign key is for filtering; the snapshot is
 * for display. Rendering a historical record must never join for a name.
 *
 * Declare the mapping on the model:
 *
 *     protected array $snapshots = [
 *         'actor_name_snapshot' => ['actor', 'name'],
 *     ];
 */
trait RecordsSnapshots
{
    public static function bootRecordsSnapshots(): void
    {
        static::creating(function (Model $model): void {
            foreach ($model->snapshotMap() as $column => [$relation, $attribute]) {
                if (filled($model->{$column})) {
                    continue;
                }

                $related = $model->{$relation};

                if ($related instanceof Model) {
                    $model->{$column} = $related->{$attribute};
                }
            }
        });
    }

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    public function snapshotMap(): array
    {
        return property_exists($this, 'snapshots') ? $this->snapshots : [];
    }
}
