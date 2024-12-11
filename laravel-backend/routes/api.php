<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatusController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (requires authentication via Sanctum)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Status-related routes (only accessible by authenticated users)
    Route::post('/status', [StatusController::class, 'store']); // Create a new status request (pending)
    Route::get('/status/{serialNumber}', [StatusController::class, 'getStatus']); // Get status by serial number
    Route::put('/status/{serialNumber}', [StatusController::class, 'updateStatus']);
    Route::get('/status/email/{email}', [StatusController::class, 'getStatusByEmail']);
});
