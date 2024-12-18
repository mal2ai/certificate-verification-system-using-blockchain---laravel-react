<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('status', function (Blueprint $table) {
            $table->string('file_hash', 64); // Add a column for file hash (SHA-256)
        });
    }

    public function down()
    {
        Schema::table('status', function (Blueprint $table) {
            $table->dropColumn('file_hash'); // Drop the column if rollback
        });
    }
};
