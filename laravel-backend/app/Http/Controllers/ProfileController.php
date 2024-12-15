<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Get user account details.
     */
    public function getDetails()
    {
        $user = Auth::user(); // Get authenticated user
        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update user account details.
     */
    public function updateDetails(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User details updated successfully.',
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Check if current password matches
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Delete user account.
     */
    public function deleteAccount(Request $request)
    {
        $user = Auth::user();

        // Optionally, verify current password before deleting
        $request->validate([
            'current_password' => 'required',
        ]);

        // Check if current password matches before deleting
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 400);
        }

        // Delete associated records from the "status" table where email matches
        DB::table('status')->where('email', $user->email)->delete();

        // Delete user account
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User account deleted successfully.',
        ]);
    }

}
