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
    public function storeTransaction($receipt)
    {
        try {
            DB::table('transactions')->insert([
                'transaction_hash' => $receipt->transactionHash,
                'from_address' => $receipt->from,
                'to_address' => $receipt->to,
                'block_number' => $receipt->blockNumber,
                'gas_used' => $receipt->gasUsed,
                'status' => $receipt->status ? 'Success' : 'Failed',
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
}
