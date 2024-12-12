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
    Route::get('/statuses', [StatusController::class, 'getAllStatuses']);

    // New route for updating status details (name, email, and serial_number)
    Route::patch('/status/update-details/{serialNumber}/{email}', [StatusController::class, 'updateDetails']);

    // New route to get user details by email, only accessible to admin
    Route::get('/user/details/{email}', [AuthController::class, 'getUserDetailsByEmail']);

    // Delete status route (only accessible by admin)
    Route::delete('/status/{serialNumber}', [StatusController::class, 'deleteStatus']);
});
