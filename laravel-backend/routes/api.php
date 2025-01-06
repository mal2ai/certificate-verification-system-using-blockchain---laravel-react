<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OTPController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\LogController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/activate-account/{token}', [AuthController::class, 'activateAccount']);

// Protected routes (requires authentication via Sanctum)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Status-related routes (only accessible by authenticated users)
    Route::post('/status', [StatusController::class, 'store']); // Create a new status request (pending)
    Route::get('/status', [StatusController::class, 'getStatus']);
    Route::put('/status/{serialNumber}', [StatusController::class, 'updateStatus']);
    Route::get('/status/email/{email}', [StatusController::class, 'getStatusByEmail']);
    Route::get('/statuses', [StatusController::class, 'getAllStatuses']);
    Route::get('/status-count', [StatusController::class, 'countStatus']);

    // New route for updating status details (name, email, and serial_number)
    Route::patch('/status/update-details/{serialNumber}/{email}', [StatusController::class, 'updateDetails']);

    // New route to get user details by email, only accessible to admin
    Route::get('/user/details/{email}', [AuthController::class, 'getUserDetailsByEmail']);

    // Delete status route (only accessible by admin)
    Route::delete('/status/{serialNumber}', [StatusController::class, 'deleteStatus']);

    // User management routes (only accessible by admin)
    Route::get('/users', [UserController::class, 'index']); // View all users
    Route::get('/users/{id}', [UserController::class, 'show']); // View a single user by ID
    Route::post('/users', [UserController::class, 'store']); // Add a new user
    Route::put('/users/{id}', [UserController::class, 'update']); // Update user details
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Delete a user

    // New route for getting the count of all users
    Route::get('/users-count', [UserController::class, 'countUsers']);

    // OTP routes (only accessible by admin for sending OTP)
    Route::post('send-otp', [OTPController::class, 'sendOTP']);
    Route::post('verify-otp', [OTPController::class, 'verifyOTP']);

    // Profile management routes
    Route::get('/profile', [ProfileController::class, 'getDetails']); // Get account/user details
    Route::put('/profile', [ProfileController::class, 'updateDetails']); // Update account/user details
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']); // Change password
    Route::post('/profile/delete-account', [ProfileController::class, 'deleteAccount']);

    // New route to store blockchain transaction details
    Route::post('/store-transaction', [TransactionController::class, 'storeTransaction']);
    
    // New route to display all stored transactions for auditing
    Route::get('/transactions', [TransactionController::class, 'getAllTransactions']);

    //logs management
    Route::post('/logs', [LogController::class, 'store']); // For creating a log
    Route::get('/logs', [LogController::class, 'index']);  // For fetching logs
});
