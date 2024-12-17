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
        $user = Auth::user();

        // Validate request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'account_type' => 'required|string|in:student,potential_employer,educational_institution,admin',
            'student_id' => 'nullable|required_if:account_type,student|string|max:255',
            'company_name' => 'nullable|required_if:account_type,potential_employer|string|max:255',
            'institution_name' => 'nullable|required_if:account_type,educational_institution|string|max:255',
        ]);

        // Update user details
        $user->name = $request->name;
        $user->email = $request->email;
        $user->account_type = $request->account_type;

        // Update fields based on account_type
        if ($request->account_type === 'student') {
            $user->student_id = $request->student_id ?? null;
            $user->company_name = null;
            $user->institution_name = null;
        } elseif ($request->account_type === 'potential_employer') {
            $user->company_name = $request->company_name ?? null;
            $user->student_id = null;
            $user->institution_name = null;
        } elseif ($request->account_type === 'educational_institution') {
            $user->institution_name = $request->institution_name ?? null;
            $user->student_id = null;
            $user->company_name = null;
        }

        // Save the updated user
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User details updated successfully.',
            'user' => $user,
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
