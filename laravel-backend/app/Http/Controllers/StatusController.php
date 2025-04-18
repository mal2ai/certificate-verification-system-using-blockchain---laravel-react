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
                'ic_number' => 'required|string|max:20', // Added validation for IC number
                'file_hash' => 'required|string|max:64', // Validate file hash (SHA-256 is 64 characters)
            ]);
            \Log::info('Validation passed', $validated); // Debug log

            // Insert into database
            $status = Status::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'serial_number' => $validated['serial_number'],
                'ic_number' => $validated['ic_number'], // Added IC number
                'file_hash' => $validated['file_hash'], // Store file hash in the database
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

    public function storeBySerialNumber(Request $request)
    {
        try {
            \Log::info('Request received for serial number verification', $request->all());

            // Validate input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'serial_number' => 'required|string|max:255',
                'ic_number' => 'required|string|max:20',
                'status' => 'required|string|max:20',
            ]);

            \Log::info('Validation passed for serial number', $validated);

            // Insert into database
            $status = Status::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'serial_number' => $validated['serial_number'],
                'ic_number' => $validated['ic_number'],
                'status' => $validated['status'],
            ]);

            \Log::info('Status created successfully by serial number', $status->toArray());

            return response()->json([
                'message' => 'Verification request created successfully (Serial Number)',
                'status' => $validated['status'],
                'data' => $status,
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Error in storeBySerialNumber', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function storeByFileHash(Request $request)
    {
        try {
            \Log::info('Request received for file hash verification', $request->all());

            // Validate input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'file_hash' => 'required|string|max:64', // Hash must be 64 characters for SHA-256
                'status' => 'required|string|max:20',
            ]);

            \Log::info('Validation passed for file hash', $validated);

            // Insert into database
            $status = Status::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'file_hash' => $validated['file_hash'],
                'status' => $validated['status'],
            ]);

            \Log::info('Status created successfully by file hash', $status->toArray());

            return response()->json([
                'message' => 'Verification request created successfully (File Hash)',
                'status' => $validated['status'],
                'data' => $status,
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Error in storeByFileHash', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    // Get status by serial number
    public function getStatus(Request $request)
    {
        try {
            // Validate the input parameters
            $request->validate([
                'email' => 'required|email',
                'serial_number' => 'required|string',
                'created_at' => 'required|date', // Ensure full timestamp format
            ]);

            // Find the status using email, serial_number, and exact created_at timestamp
            $status = Status::where('email', $request->email)
                ->where('serial_number', $request->serial_number)
                ->where('created_at', $request->created_at) // Exact match on timestamp
                ->first();

            // If status exists, return it
            if ($status) {
                return response()->json($status);
            }

            // If no status found, return a 404 error
            return response()->json(['message' => 'Request not found'], 404);
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

    // Get status by ID
    public function getStatusById($status_id)
    {
        try {
            // Find the status by ID
            $status = Status::where('id', $status_id)->first();

            // If status exists, return it
            if ($status) {
                return response()->json($status);
            }

            // If no status found, return a 404 error
            return response()->json(['message' => 'Status not found for the provided ID'], 404);
        } catch (Exception $e) {
            // Return a 500 error in case of unexpected exceptions
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    // Update the status of a certificate (approved or rejected) based on serial_number
    public function updateStatus(Request $request, $id)
    {
        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'status' => 'required|in:approved,rejected', // Only allow approved or rejected statuses
            ]);

            // Find the status by ID
            $status = Status::find($id);

            // If status not found, return a 404 error
            if (!$status) {
                return response()->json(['message' => 'Status not found'], 404);
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
    public function getAllStatuses(Request $request)
    {
        try {
            // Check if the user is an admin
            if ($request->user()->role !== 'admin') {
                return response()->json(['message' => 'Access denied. Admins only.'], 403);
            }

            // Retrieve all statuses
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

    // Delete a status by id
    public function deleteStatusById(Request $request, $id)
    {
        try {
            // Check if the authenticated user is an admin
            if ($request->user()->role !== 'admin') {
                return response()->json(['message' => 'You are not authorized to delete this status.'], 403);
            }

            // Find the status by ID
            $status = Status::find($id);

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

    // Update name, email, and serial number by id
    public function updateDetailsById(Request $request, $id)
    {
        try {
            // Validate the incoming request data
            $validated = $request->validate([
                'name' => 'nullable|string|max:255', // Name is optional
                'email' => 'nullable|email', // Email is optional
                'serial_number' => 'nullable|string|max:255', // Serial number is optional
                'ic_number' => 'nullable|string|max:20', // IC number is optional
                'file_hash' => 'nullable|string|max:255', // file_hash is optional
            ]);

            // Find the status by ID
            $status = Status::find($id);

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
            if (isset($validated['ic_number'])) {
                $status->ic_number = $validated['ic_number'];
            }
            if (isset($validated['file_hash'])) {
                $status->file_hash = $validated['file_hash'];
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
