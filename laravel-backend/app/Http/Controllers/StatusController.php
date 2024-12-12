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
            ]);

            // Find the status by serial_number
            $status = Status::where('serial_number', $serialNumber)->first();

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

}
