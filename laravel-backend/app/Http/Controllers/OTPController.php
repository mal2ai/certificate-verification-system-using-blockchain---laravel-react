<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Status;
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

        // Validate the email and status_id input
        $request->validate([
            'email' => 'required|email|exists:users,email', // Check if the email exists in the users table
            'status_id' => 'required|exists:status,id', // Validate that the status_id exists in the status table
        ]);

        $email = $request->input('email');
        $status_id = $request->input('status_id');
        
        // Log the email and status_id being validated
        \Log::info("Validating email: $email with status_id: $status_id");

        // Try manually fetching the user
        $user = User::where('email', $email)->first();
        \Log::info("User found: ", $user ? $user->toArray() : 'No user found');

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Fetch the status with the provided status_id
        $status = Status::find($status_id);

        if (!$status || $status->status !== 'approved') {
            return response()->json(['message' => 'Invalid or unapproved status for this status_id.'], 400);
        }

        // Generate a 6-digit OTP
        $otp = rand(100000, 999999);
        
        // Hash the OTP using bcrypt
        $hashedOtp = bcrypt($otp);

        // Store the hashed OTP and status_id in the database
        $user->otp_code = $hashedOtp; // Assuming `otp_code` is a column in the `users` table
        $user->status_id = $status_id; // Store the status_id for the user
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
            'otp' => 'required|numeric|digits:6', // Ensure OTP is a 6-digit number
            'email' => 'required|email', // Ensure email is provided
            'status_id' => 'required|exists:status,id' // Validate status_id is provided and exists in the 'status' table
        ]);

        $email = $request->input('email'); // The email for OTP verification
        $status_id = $request->input('status_id'); // The status_id from the request

        // Retrieve the user by email
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Ensure that the status_id matches the stored status_id for the user
        if ($user->status_id !== $status_id) {
            return response()->json(['message' => 'Invalid status ID.'], 400);
        }

        // Retrieve the stored (hashed) OTP and compare with the entered OTP
        $storedOtp = $user->otp_code;
        $enteredOtp = $request->input('otp');

        if (Hash::check($enteredOtp, $storedOtp)) {
            // Clear the OTP and status_id after successful verification
            $user->otp_code = null;
            $user->status_id = null;
            $user->save();

            return response()->json(['message' => 'OTP verified successfully!'], 200);
        } else {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }
    }
}
