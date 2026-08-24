<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Layering rules
|--------------------------------------------------------------------------
|
| docs/03-architecture.md §3. Dependencies point inward:
|
|     Http / Filament  ->  Domain  ->  Support
|
| This is what lets the admin UI be replaced later without rewriting business
| logic, and it is what keeps the platform layer reusable on the next LPKmn
| system. These tests fail the build rather than relying on review to catch it.
|
*/

arch('domain does not depend on the admin UI or HTTP layer')
    ->expect('App\Domain')
    ->not->toUse(['App\Filament', 'App\Http']);

arch('support does not depend on domain, admin UI or HTTP layer')
    ->expect('App\Support')
    ->not->toUse(['App\Domain', 'App\Filament', 'App\Http']);

arch('domain holds no framework glue')
    ->expect('App\Domain')
    ->not->toUse([
        'Illuminate\Http\Request',
        'Illuminate\Support\Facades\Route',
        'Livewire\Component',
    ]);

/*
|--------------------------------------------------------------------------
| Hygiene
|--------------------------------------------------------------------------
*/

arch('no debugging statements ship')
    ->expect(['dd', 'dump', 'ray', 'var_dump', 'print_r', 'die'])
    ->not->toBeUsed();

arch('everything is strictly typed')
    ->expect('App')
    ->toUseStrictTypes();

arch('models live where models belong')
    ->expect('App\Domain')
    ->classes()
    ->toBeClasses();

/*
|--------------------------------------------------------------------------
| Security (CLAUDE.md §7)
|--------------------------------------------------------------------------
*/

arch('nothing reaches for env() outside config')
    ->expect('env')
    ->not->toBeUsed()
    ->ignoring('App\Providers');
