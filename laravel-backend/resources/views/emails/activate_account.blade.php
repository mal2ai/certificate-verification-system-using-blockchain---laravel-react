<!DOCTYPE html>
<html>
<head>
    <title>KPBKL - Activate Your Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color:rgb(210, 210, 211);
            padding: 20px;
            text-align: center;
            color: #ffffff;
        }
        .header img {
            max-width: 100px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333;
        }
        .content p {
            color: #555;
            line-height: 1.6;
        }
        .activation-link {
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #ffffff;
            background-color: #0056b3;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            display: inline-block;
            text-align: center;
        }
        .footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #999;
        }
        .red-text {
            color: red;
        }
        .black-text {
            color: black;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
        <img src="https://i.imgur.com/SF9k5qz.png" alt="Kolej Professional Baitumal Logo" style="height: 70px;width: 70px;">
            <h1>
                <span style="color: red;">Kolej Professional Baitumal</span>
                <span style="color: black;">Kuala Lumpur</span>
            </h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>Welcome {{ $user->name }},</h2>
            <p>Thank you for registering with the Certificate Verification System powered by blockchain technology.</p>
            <p>To complete your registration, please click the button below to activate your account:</p>
            <p style="text-align: center;">
                <a href="{{ $activationLink }}"
                style="font-family: Arial, sans-serif; font-size: 16px; color: #ffffff; background-color:rgb(48, 136, 230); padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; text-align: center;"
                onmouseover="this.style.backgroundColor='#003d80'; this.style.color='#e0e0e0';"
                onmouseout="this.style.backgroundColor='#0056b3'; this.style.color='#ffffff';">
                    Activate My Account
                </a>
            </p>
            <p>This system ensures secure and trustworthy verification of certificates issued by Kolej Professional Baitumal Kuala Lumpur.</p>
            <p>If you did not register for this account, please ignore this email. For further assistance, contact us at <strong>support@kpbkl.edu.my</strong>.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2025 Kolej Professional Baitumal Kuala Lumpur. All Rights Reserved.</p>
            <p>Need help? Contact us at <strong>support@kpbkl.edu.my</strong></p>
        </div>
    </div>
</body>
</html>
