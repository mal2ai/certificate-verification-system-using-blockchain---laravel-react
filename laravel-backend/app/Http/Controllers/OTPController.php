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
    //funtions to sent OTP to the user
    public function sendOTP(Request $request)
    {
        \Log::info('sendOTP method is called');

        // Ensure the user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'You are not authorized to perform this action.'], 403);
        }

        // Validate email and status_id input
        $validatedData = $request->validate([
            'email' => 'required|email|exists:users,email',
            'status_id' => 'required|exists:status,id',
        ]);

        $email = $validatedData['email'];
        $status_id = $validatedData['status_id'];

        // Fetch the user
        $user = User::where('email', $email)->first();

        if (!$user) {
            \Log::warning("User not found with email: $email");
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Verify the status with the provided status_id
        $status = Status::find($status_id);

        if (!$status || $status->status !== 'approved') {
            \Log::warning("Invalid or unapproved status for status_id: $status_id");
            return response()->json(['message' => 'Invalid or unapproved status.'], 400);
        }

        // Get the ic_number, serial_number, and updated_at from the status
        $icNumber = $status->ic_number;
        $serialNumber = $status->serial_number;
        $updatedAt = $status->updated_at;

        // Generate a secure 6-digit OTP
        $otp = random_int(100000, 999999);

        // Hash the OTP using bcrypt
        $hashedOtp = bcrypt($otp);

        // Update the user with the hashed OTP and status_id
        $user->update([
            'otp_code' => $hashedOtp,
            'status_id' => $status_id,
            'otp_sent_at' => now(),
        ]);

        try {
            // Pass user data, OTP, ic_number, serial_number, and updated_at to the Blade view
            Mail::send('emails.otp_email', [
                'otp' => $otp,
                'user' => $user,
                'ic_number' => $icNumber,
                'serial_number' => $serialNumber,
                'updated_at' => $updatedAt,
            ], function ($message) use ($email) {
                $message->to($email)->subject('KPBKL - Verifying Academic Certificates');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send email: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send OTP email.'], 500);
        }

        // Log the OTP (debug purposes)
        \Log::debug("OTP sent: $otp");

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
