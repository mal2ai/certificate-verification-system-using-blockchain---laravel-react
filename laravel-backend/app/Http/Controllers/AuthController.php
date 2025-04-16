<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Mail\ActivationEmail;
use Illuminate\Support\Facades\Mail;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    // Login method
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check account status
        if ($user->status !== 'active') {
            return response()->json([
                'message' => "Your account is {$user->status}. Please contact the administrator."
            ], 403);
        }

        // Attempt authentication
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->is_2fa_enabled) {
            // Generate a temporary token for verification
            $tempToken = $user->createToken('mfa_token', ['mfa'])->plainTextToken;

            return response()->json([
                'mfa_required' => true,
                'email' => $user->email,
                'role' => $user->role,
                'temp_token' => $tempToken,
                'status' => $user->status, // Optional: send status info if needed on frontend
            ]);
        }

        // Issue permanent token if MFA is disabled
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'email' => $user->email,
            'status' => $user->status, // Optional
        ]);
    }

    public function register(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/'
            ], // Password validation rule
            'account_type' => 'required|string|in:student,potential_employer,educational_institution', // Validate account_type
            'student_id' => 'nullable|string|max:255', // Only required if account_type is student
            'company_name' => 'nullable|string', // Only required if account_type is potential_employer
            'institution_name' => 'nullable|string', // Only required if account_type is educational_institution
        ], [
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
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

        // Generate activation token
        $token = Str::random(64);
        \DB::table('activation_tokens')->insert([
            'user_id' => $user->id,
            'token' => $token,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send activation email
        $activationLink = url('/api/activate-account/' . $token);
        Mail::to($user->email)->send(new ActivationEmail($user, $activationLink));

        // Return response with the user data (excluding password)
        return response()->json([
            'message' => 'Registration successful. Please check your email to activate your account.',
            'user' => $user->only('id', 'name', 'email', 'role', 'account_type', 'student_id', 'company_name', 'institution_name')
        ], 201);
    }

    public function activateAccount($token)
    {
        // Find the activation token
        $activation = \DB::table('activation_tokens')->where('token', $token)->first();

        if (!$activation) {
            return response()->json(['message' => 'Invalid activation link'], 400);
        }

        // Activate the user
        $user = User::find($activation->user_id);
        $user->status = 'active';
        $user->save();

        // Delete the activation token
        \DB::table('activation_tokens')->where('token', $token)->delete();

        // Return the Blade view
        return view('account_activated');
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
