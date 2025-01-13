<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;


class ActivationEmail extends Mailable
{
    public $user;
    public $activationLink;

    public function __construct($user, $activationLink)
    {
        $this->user = $user;
        $this->activationLink = $activationLink;
    }

    public function build()
    {
        return $this->subject('KPBKL - Activate Your Account')
                    ->view('emails.activate_account')
                    ->with([
                        'user' => $this->user,
                        'activationLink' => $this->activationLink,
                    ]);
    }
}
