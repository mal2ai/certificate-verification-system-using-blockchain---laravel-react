<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Activated</title>
    <style>
        body {
            font-family: 'Roboto', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9; /* Soft white background */
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            text-align: center;
            background-color: #ffffff; /* Slightly darker card */
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #ececec; /* Light border to define the card */
            max-width: 450px;
            width: 90%;
            margin: auto;
            animation: fadeIn 1.5s ease-out;
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        .logo {
            width: 100px;
            height: auto;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 26px;
            color: #4CAF50;
            margin-bottom: 15px;
            font-weight: bold;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
        }
        .redirect-info {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
        }
        .countdown {
            font-weight: bold;
            color: #4CAF50;
        }
        .button-container {
            margin-top: 30px;
        }
        .btn {
            background: #4CAF50;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        .btn:hover {
            background: #388E3C;
        }
        @media (max-width: 480px) {
            h1 {
                font-size: 22px;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Logo -->
        <img src="https://www.kpbkl.edu.my/2025/wp-content/uploads/2024/08/kpbkl-logo-horizontal.webp"
             alt="Kolej Professional Baitumal Logo" class="logo">

        <!-- Content -->
        <h1>Account Activated</h1>
        <p>Your account has been successfully activated. You can now log in and start using your account.</p>
        <p class="redirect-info">
            You will be redirected to the sign-in page in <span id="countdown" class="countdown">10</span> seconds.
        </p>

        <!-- Button -->
        <div class="button-container">
            <a href="http://localhost:3000/sign-in" class="btn">Go to Sign-In Page</a>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            let countdown = 10;
            const countdownElement = document.getElementById('countdown');

            function updateCountdown() {
                countdown--;
                if (countdownElement) {
                    countdownElement.innerText = countdown;
                }
                if (countdown <= 0) {
                    window.location.href = "http://localhost:3000/sign-in";
                }
            }

            setInterval(updateCountdown, 1000); // Update every second
        });
    </script>
</body>
</html>
