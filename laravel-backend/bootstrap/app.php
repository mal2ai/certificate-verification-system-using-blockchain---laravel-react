<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php', // Ensure api.php is referenced correctly here
        web: __DIR__.'/../routes/web.php',  // Make sure the web routes are also included
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function ($middleware) {
        $middleware->api(append: [
            EnsureFrontendRequestsAreStateful::class,  // Add Sanctum middleware
            SubstituteBindings::class,  // Ensure route model binding works
        ]);
    })
    ->withExceptions(function ($exceptions) {
        // Configure custom exception handling if needed
    })
    ->create();
