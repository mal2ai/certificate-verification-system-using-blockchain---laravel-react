<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    // Mass assignable fields
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'otp_code',
        'otp_sent_at',
        'status',
        'account_type',
        'student_id',
        'company_name',
        'institution_name',
        'status_id'
    ];

    // Attributes hidden for serialization
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Casting attributes
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    // Adding a custom validation for account_type-specific fields
    public static function boot()
    {
        parent::boot();

    }
}
