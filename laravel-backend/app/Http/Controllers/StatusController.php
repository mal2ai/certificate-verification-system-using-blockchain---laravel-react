<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;

class StatusController extends Controller
{
    // Store a new verification request with 'pending' status
    public function store(Request $request)
    {
        try {
            \Log::info('Request received', $request->all()); // Debug log

            // Validate input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'serial_number' => 'required|string|max:255',
            ]);
            \Log::info('Validation passed', $validated); // Debug log

            // Insert into database
            $status = Status::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'serial_number' => $validated['serial_number'],
                'status' => 'pending',
            ]);
            \Log::info('Status created successfully', $status->toArray()); // Debug log

            return response()->json([
                'message' => 'Verification request created successfully',
                'status' => 'pending',
                'data' => $status,
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Error in StatusController@store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    // Get status by serial number
    public function getStatus($serialNumber)
    {
        try {
            // Find the status by the serial number
            $status = Status::where('serial_number', $serialNumber)->first();

            // If status exists, return it
            if ($status) {
                return response()->json($status);
            }

            // If no status found, return a 404 error
            return response()->json(['message' => 'Status not found'], 404);
        } catch (Exception $e) {
            // Return a 500 error in case of unexpected exceptions
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Get status by email
    public function getStatusByEmail($email)
    {
        try {
            // Find the status by email
            $status = Status::where('email', $email)->get();

            // If status exists, return it
            if ($status->isNotEmpty()) {
                return response()->json($status);
            }

            // If no status found, return a 404 error
            return response()->json(['message' => 'Status not found for the provided email'], 404);
        } catch (Exception $e) {
            // Return a 500 error in case of unexpected exceptions
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Update the status of a certificate (approved or rejected) based on serial_number
    public function updateStatus(Request $request, $serialNumber)
    {
        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'status' => 'required|in:approved,rejected', // Only allow approved or rejected statuses
                'email' => 'required|email', // Validate email format
            ]);

            // Find the status by serial_number and email
            $status = Status::where('serial_number', $serialNumber)
                            ->where('email', $validated['email']) // Ensure the email matches
                            ->first();

            // If status not found, return a 404 error
            if (!$status) {
                return response()->json(['message' => 'Status not found or email does not match'], 404);
            }

            // Update the status
            $status->update([
                'status' => $validated['status'],
            ]);

            // Return the updated status
            return response()->json([
                'message' => 'Status updated successfully',
                'status' => $status
            ]);
        } catch (Exception $e) {
            // Catch any other exceptions and return a 500 error
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    //get all status for admin
    public function getAllStatuses()
    {
        try {
            // Retrieve all statuses, you can paginate or return all records as needed
            $statuses = Status::all();

            // If there are statuses, return them
            if ($statuses->isNotEmpty()) {
                return response()->json($statuses);
            }

            // If no statuses found, return a 404 error
            return response()->json(['message' => 'No statuses found'], 404);
        } catch (Exception $e) {
            // Catch any other exceptions and return a 500 error
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Delete a status by serial number
    public function deleteStatus(Request $request, $serialNumber)
    {
        try {
            // Check if the authenticated user is an admin
            if ($request->user()->role !== 'admin') {
                return response()->json(['message' => 'You are not authorized to view user details.'], 403);
            }

            // Find the status by serial number
            $status = Status::where('serial_number', $serialNumber)->first();

            // If status not found, return a 404 error
            if (!$status) {
                return response()->json(['message' => 'Status not found'], 404);
            }

            // Delete the status
            $status->delete();

            // Return a success message
            return response()->json(['message' => 'Status deleted successfully']);
        } catch (Exception $e) {
            // Catch any other exceptions and return a 500 error
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Update name, email, and serial number by serial number and email
    public function updateDetails(Request $request, $serialNumber, $email)
    {
        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'name' => 'nullable|string|max:255', // Name is optional
                'email' => 'nullable|email', // Email is optional
                'serial_number' => 'nullable|string|max:255', // Serial number is optional
            ]);

            // Find the status by serial_number and email
            $status = Status::where('serial_number', $serialNumber)
                            ->where('email', $email)
                            ->first();

            // If status not found, return a 404 error
            if (!$status) {
                return response()->json(['message' => 'Status not found'], 404);
            }

            // Update fields if they are provided
            if (isset($validated['name'])) {
                $status->name = $validated['name'];
            }
            if (isset($validated['email'])) {
                $status->email = $validated['email'];
            }
            if (isset($validated['serial_number'])) {
                $status->serial_number = $validated['serial_number'];
            }

            // Save the updated status
            $status->save();

            // Return the updated status
            return response()->json([
                'message' => 'Details updated successfully',
                'status' => $status
            ]);
        } catch (Exception $e) {
            // Catch any other exceptions and return a 500 error
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Get count of all Status
    public function countStatus(Request $request)
    {
        // Check if the user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Access denied. Admins only.'], 403);
        }

        // Count only the rows where the status is "pending"
        $pendingCount = Status::where('status', 'pending')->count();

        // Return the count of "pending" statuses
        return response()->json(['count' => $pendingCount]);
    }
}
