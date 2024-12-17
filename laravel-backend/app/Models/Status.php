<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'status'; // Specify the table name

    protected $fillable = [
        'name',
        'email',
        'serial_number',
        'ic_number',
        'status',
    ];
}
