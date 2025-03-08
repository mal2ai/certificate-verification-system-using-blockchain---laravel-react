<!DOCTYPE html>
<html>
<head>
    <title>Certificate Verification Approved</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 800px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: rgb(210, 210, 211);
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 200px;
            width: 100%;
            height: auto;
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
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        .otp-card {
            display: inline-block;
            background-color: rgb(247, 247, 247);
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 18px;
            color: #333;
            font-weight: bold;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .details-table th, .details-table td {
            text-align: center;
            padding: 10px;
        }
        .details-table th {
            background-color: #f0f0f0;
            color: #333;
            font-weight: bold;
            border-bottom: 2px solid #ddd;
        }
        .details-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .details-table tr:nth-child(odd) {
            background-color: #ffffff;
        }
        .footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #999;
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
            <h2>Dear {{ $user->name }},</h2>
            <p>We are pleased to inform you that your request to verify academic certificates has been successfully approved. Below is the details of your request:</p>

            <!-- Table Details -->
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>IC Number</th>
                        <th>Email</th>
                        <th>Serial Number</th>
                        <th>Created at</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ $user->name }}</td>
                        <td>{{ $ic_number }}</td>
                        <td>{{ $user->email }}</td>
                        <td>{{ $serial_number }}</td>
                        <td>{{ $updated_at }}</td>
                        <td>Approved</td>
                    </tr>
                </tbody>
            </table>

            <p style="margin-top:20px;">You can now view the certificate details by inserting the OTP code below in your request on our website, just click <a href="http://localhost:3000/status">here</a> to redirect to our website:</p>
            <div class="button-container">
                <div class="otp-card">{{ $otp }}</div>
            </div>
            <p>If you encounter any issues or have any questions, please do not hesitate to contact us at <strong>support@kpbkl.edu.my</strong>.</p>
            <p>Thank you for using our Certificate Verification System.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2025 Kolej Professional Baitumal Kuala Lumpur. All Rights Reserved.</p>
            <p>Need help? Contact us at <strong>support@kpbkl.edu.my</strong></p>
        </div>
    </div>
</body>
</html>
