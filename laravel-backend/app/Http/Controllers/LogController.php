<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'req_id' => 'nullable|int',
            'admin_email' => 'nullable|email',
            'user_email' => 'nullable|email',
            'action' => 'required|string',
            'module' => 'required|string',
            'serial_number' => 'nullable|string',
            'tx_hash' => 'nullable|string',
            'status' => 'nullable|string',
            'additional_info' => 'nullable|string',
        ]);

        // Create the log entry
        $log = Log::create($validated);

        return response()->json(['message' => 'Log created successfully', 'log' => $log], 201);
    }

    public function index()
    {
        // Retrieve all logs
        $logs = Log::all();

        return response()->json($logs);
    }
}
