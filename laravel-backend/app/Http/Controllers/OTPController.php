<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class OTPController extends Controller
{
    // Function to send OTP to the user's email
    public function sendOTP(Request $request)
    {
        \Log::info('sendOTP method is called');
        
        // Check if the user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'You are not authorized to perform this action.'], 403);
        }

        // Validate the email input
        $request->validate([
            'email' => 'required|email|exists:users,email', // Check email in the users table explicitly
        ]);

        $email = $request->input('email');
        
        // Log the email being validated
        \Log::info("Validating email: $email");

        // Try manually fetching the user
        $user = User::where('email', $email)->first();
        \Log::info("User found: ", $user ? $user->toArray() : 'No user found');

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        
        // Generate a 6-digit OTP
        $otp = rand(100000, 999999);
        
        // Hash the OTP using bcrypt
        $hashedOtp = bcrypt($otp);

        // Store the hashed OTP in the database (or store it in a dedicated table for OTPs)
        $user->otp_code = $hashedOtp; // Assuming `otp_code` is a column in the `users` table
        $user->otp_sent_at = now(); // Store the timestamp when OTP was sent (optional)
        $user->save();

        try {
            // Send OTP to the user's email
            Mail::send([], [], function ($message) use ($email, $otp) {
                $message->to($email)
                        ->subject('Your OTP Code')
                        ->html("Your OTP code is: $otp");  // Sends as HTML content
            });
        } catch (\Exception $e) {
            \Log::error('Mail error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send OTP.'], 500);
        }

        \Log::debug("OTP: $otp");

        return response()->json(['message' => 'OTP sent successfully!'], 200);
    }

    // Function to verify the OTP entered by the user
    public function verifyOTP(Request $request)
    {
        // Validate the input
        $request->validate([
            'otp' => 'required|numeric|digits:6',
            'email' => 'required|email' // Added email validation for the OTP verification process
        ]);

        $email = $request->input('email'); // Assuming the user also sends their email for OTP verification

        // Retrieve the user and the stored hashed OTP
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $storedOtp = $user->otp_code;
        $enteredOtp = $request->input('otp');

        // Check if the entered OTP matches the stored (hashed) OTP
        if (Hash::check($enteredOtp, $storedOtp)) {
            // Optionally, you can clear the OTP after successful verification
            $user->otp_code = null; // Clear OTP from the database
            $user->save();

            return response()->json(['message' => 'OTP verified successfully!'], 200);
        } else {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }
    }
}
