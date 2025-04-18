<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Store blockchain transaction details in the database.
     *
     * @param  object $receipt
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeTransaction(Request $request)
    {
        try {
            $data = $request->validate([
                'transactionHash' => 'required|string',
                'from' => 'required|string',
                'to' => 'required|string',
                'blockNumber' => 'required|string',
                'gasUsed' => 'required|string',
                'status' => 'required|string',
                'action' => 'required|string', // Add validation for the "action" attribute
            ]);

            DB::table('transactions')->insert([
                'transaction_hash' => $data['transactionHash'],
                'from_address' => $data['from'],
                'to_address' => $data['to'],
                'block_number' => $data['blockNumber'],
                'gas_used' => $data['gasUsed'],
                'status' => $data['status'],
                'action' => $data['action'], // Include the "action" attribute
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Transaction details stored successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to store transaction details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllTransactions(Request $request)
    {
        try {
            // Check if the user is an admin
            if ($request->user()->role !== 'admin') {
                return response()->json(['message' => 'Access denied. Admins only.'], 403);
            }

            // Retrieve all transactions from the 'transactions' table
            $transactions = DB::table('transactions')->get();

            // Return the transactions in the response
            return response()->json([
                'transactions' => $transactions,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve transactions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
