<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusAndAccountTypeToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['inactive', 'banned', 'active'])->default('inactive');
            $table->enum('account_type', ['student', 'Potential Employer', 'Educational Institution']);
            $table->string('student_id')->nullable();
            $table->string('company_name')->nullable();
            $table->string('institution_name')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'account_type', 'student_id', 'company_name', 'institution_name']);
        });
    }
}
