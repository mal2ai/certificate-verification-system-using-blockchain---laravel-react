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
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->string('admin_email');
            $table->string('user_email');
            $table->string('action'); 
            $table->string('module');
            $table->string('serial_number')->nullable();
            $table->string('tx_hash')->nullable(); 
            $table->string('status')->nullable(); 
            $table->text('additional_info')->nullable(); 
            $table->timestamps(); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('logs');
    }
};
