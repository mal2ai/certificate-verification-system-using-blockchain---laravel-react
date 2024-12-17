<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // Login method
    public function login(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        try {
            // Check if user exists
            $user = User::where('email', $validated['email'])->first();

            if ($user) {
                // Check if the status is inactive or banned
                if (in_array($user->status, ['inactive'])) {
                    return response()->json(['message' => 'Your account is inactive.'], 403); // Forbidden
                }

                if (in_array($user->status, ['banned'])) {
                    return response()->json(['message' => 'Your account is banned.'], 403); // Forbidden
                }

                // Check if the password is correct
                if (Hash::check($validated['password'], $user->password)) {
                    // Create token for the user
                    $token = $user->createToken('API Token')->plainTextToken;

                    // Return response with the token
                    return response()->json([
                        'message' => 'Login successful',
                        'token' => $token,
                        'role' => $user->role,
                    ], 200);
                }

                // Return error if credentials are wrong
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            // Return error if user doesn't exist
            return response()->json(['message' => 'User not found'], 404);

        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error('Login Error: ' . $e->getMessage());

            return response()->json(['message' => 'An error occurred during login'], 500);
        }
    }

    public function register(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
            'account_type' => 'required|string|in:student,potential_employer,educational_institution', // Validate account_type
            'student_id' => 'nullable|string|max:255', // Only required if account_type is student
            'company_name' => 'nullable|string', // Only required if account_type is potential_employer
            'institution_name' => 'nullable|string', // Only required if account_type is educational_institution
        ]);

        // Add account_type specific data
        $additionalData = [];

        // Handle account_type logic
        if ($validated['account_type'] == 'student') {
            $validated['student_id'] = $validated['student_id'] ?? null; // Ensure student_id is provided if account_type is student
            if (!$validated['student_id']) {
                return response()->json(['message' => 'Student ID is required for student account type'], 400);
            }
            $additionalData['student_id'] = $validated['student_id'];
        }

        if ($validated['account_type'] == 'potential_employer') {
            $validated['company_name'] = $validated['company_name'] ?? null; // Ensure company_name is provided for potential_employer
            if (!$validated['company_name']) {
                return response()->json(['message' => 'Company name is required for potential employer account type'], 400);
            }
            $additionalData['company_name'] = $validated['company_name'];
        }

        if ($validated['account_type'] == 'educational_institution') {
            $validated['institution_name'] = $validated['institution_name'] ?? null; // Ensure institution_name is provided for educational_institution
            if (!$validated['institution_name']) {
                return response()->json(['message' => 'Institution name is required for educational institution account type'], 400);
            }
            $additionalData['institution_name'] = $validated['institution_name'];
        }

        // Create the user with the default role of 'user'
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']), // Hash the password
            'role' => 'user', // Set the role to 'user'
            'account_type' => $validated['account_type'], // Add account_type
            ...$additionalData, // Insert the additional data (student_id, company_name, or institution_name)
        ]);

        // Return response with the user data (excluding password)
        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->only('id', 'name', 'email', 'role', 'account_type', 'student_id', 'company_name', 'institution_name')
        ], 201);
    }

    // Logout method
    public function logout(Request $request)
    {
        // Revoke the user's current token
        $request->user()->tokens->each(function ($token) {
            $token->delete();
        });

        // Return a success response
        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    // Get authenticated user details (optional)
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Function to get user details by email, only accessible to "admin"
    public function getUserDetailsByEmail($email, Request $request)
    {
        // Check if the authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'You are not authorized to view user details.'], 403);
        }

        // Retrieve user details by email
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Return user details excluding password
        return response()->json($user, 200);
    }

}
