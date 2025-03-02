<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = [
        'req_id',
        'admin_email',
        'user_email',
        'action',
        'module',
        'serial_number',
        'tx_hash',
        'status',
        'additional_info',
    ];
}
