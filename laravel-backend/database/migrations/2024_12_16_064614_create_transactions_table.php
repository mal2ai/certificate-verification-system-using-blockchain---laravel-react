<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->string('transaction_hash')->unique(); // Transaction hash
            $table->string('from_address'); // Address initiating the transaction
            $table->string('to_address'); // Contract address
            $table->unsignedBigInteger('block_number'); // Block number
            $table->unsignedBigInteger('gas_used'); // Gas consumed
            $table->string('status'); // Status (e.g., Success or Failed)
            $table->timestamps(); // Includes created_at and updated_at fields
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}
