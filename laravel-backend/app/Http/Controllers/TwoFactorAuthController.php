<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use PragmaRX\Google2FA\Google2FA;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Hash;

class TwoFactorAuthController extends Controller
{
    public function QR2FA(Request $request) {
        $user = auth()->user();
        $google2fa = new Google2FA();

        // Generate a new secret key
        $secret = $google2fa->generateSecretKey();
        $user->google2fa_secret = $secret;
        $user->save();

        // Generate OTP Auth URL
        $otpAuthUrl = "otpauth://totp/Certificate Verification System:{$user->email}?secret={$secret}&issuer=Certificate Verification System";

        // ✅ Use SVG backend to avoid Imagick
        $writer = new Writer(
            new ImageRenderer(
                new RendererStyle(200),
                new SvgImageBackEnd()
            )
        );

        // Generate QR Code in SVG format
        $qrCode = base64_encode($writer->writeString($otpAuthUrl));

        return response()->json([
            'qr_code' => $qrCode, // Base64-encoded QR Code (SVG format)
            'secret' => $secret,
        ]);
    }

    public function enable2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        $user = auth()->user();
        $google2fa = new Google2FA();

        $isValid = $google2fa->verifyKey($user->google2fa_secret, $request->code);

        if ($isValid) {
            $user->is_2fa_enabled = true;
            $user->save();

            return response()->json(['success' => true, 'message' => 'MFA enabled successfully!']);
        } else {
            return response()->json(['success' => false, 'message' => 'Invalid MFA code.'], 400);
        }
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        // Get user from the temporary token
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $google2fa = new Google2FA();
        $isValid = $google2fa->verifyKey($user->google2fa_secret, $request->code);

        if ($isValid) {
            // Revoke temporary token
            $user->tokens()->where('name', 'mfa_token')->delete();

            // Issue the real authentication token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'role' => $user->role,
                'email' => $user->email,
                'message' => 'MFA verification successful',
            ]);
        } else {
            return response()->json(['message' => 'Invalid MFA code'], 400);
        }
    }

    public function disable2FA(Request $request)
    {
        $user = auth()->user();

        if (!$user->is_2fa_enabled) {
            return response()->json(['success' => false, 'message' => 'MFA is already disabled.'], 400);
        }

        // Validate the request
        $request->validate([
            'current_password' => 'required|string',
        ]);

        // Check if the provided current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 400);
        }

        // Disable MFA
        $user->is_2fa_enabled = false;
        $user->google2fa_secret = null;
        $user->save();

        return response()->json(['success' => true, 'message' => 'MFA has been disabled.']);
    }

    public function getMFAStatus(Request $request)
    {
        $user = auth()->user();

        return response()->json([
            'is_2fa_enabled' => $user->is_2fa_enabled,
            'google2fa_secret' => $user->google2fa_secret,
        ]);
    }

}
