<?php

declare(strict_types=1);

namespace App\Support\Models;

use App\Support\Models\Concerns\RecordsSnapshots;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Every model in this system extends this.
 *
 * Soft delete is not optional (G2 / ADR 0003). The Garis Panduan requires that
 * deleting a user, a lookup value or an application leaves prior work intact,
 * so nothing is ever physically removed by application code.
 *
 * The one exception is audit_logs, which has no deleted_at and is trimmed only
 * by the retention purge that GP-18 requires — and that purge records itself.
 */
abstract class BaseModel extends Model
{
    use RecordsSnapshots;
    use SoftDeletes;

    protected $guarded = ['id'];
}
