<!DOCTYPE html>
<html>
<head>
    <title>Activate Your Account</title>
</head>
<body>
    <p>Hi {{ $user->name }},</p>
    <p>Thank you for registering. Please click the link below to activate your account:</p>
    <a href="{{ $activationLink }}">Activate Account</a>
    <p>If you did not register, please ignore this email.</p>
</body>
</html>