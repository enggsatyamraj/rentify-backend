import { EmailType } from "../enums";

interface EmailTemplates {
    [key: string]: {
        subject: string;
        html: string;
    }
}


export const EMAIL_TEMPLATES = (payload: { [key: string]: any }, key: EmailType) => {
    const values: EmailTemplates = {
        [EmailType.OTP_VERIFICATION]: {
            subject: 'Verify Your Email - OTP',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .otp-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        font-size: 32px;
                        letter-spacing: 8px;
                        margin: 25px 0;
                        border-radius: 8px;
                        border: 1px solid #e9ecef;
                    }
                    .footer { margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://s3.eu-north-1.amazonaws.com/bucket.satyam.dev/House+1.png" alt="Rentify">
                    </div>
                    <h2 style="color: #2c3e50; text-align: center;">Verify Your Email</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>Please use the following verification code to complete your email verification:</p>
                    <div class="otp-box">
                        <strong>${payload.otp}</strong>
                    </div>
                    <p style="color: #dc3545;"><strong>This code will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
                    <div class="footer">
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },
        [EmailType.WELCOME_VERIFIED]: {
            subject: 'Welcome to Rentify - Your Journey Begins!',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .features { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer { margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://s3.eu-north-1.amazonaws.com/bucket.satyam.dev/House+1.png" alt="Rentify">
                    </div>
                    <h2 style="color: #2c3e50; text-align: center;">Welcome to Rentify!</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>Your account has been successfully verified. Welcome to our community!</p>
                    
                    <div class="features">
                        <h3>What you can do now:</h3>
                        <ul>
                            <li>Search and filter properties based on your preferences</li>
                            <li>Book properties with secure payment options</li>
                            <li>Save your favorite properties</li>
                            <li>Manage your bookings and profile</li>
                            <li>Contact property owners directly</li>
                        </ul>
                    </div>

                    <center><a href="${payload.loginUrl}" class="button">Start Exploring</a></center>

                    <div class="footer">
                        <p>If you need any assistance, our support team is always here to help.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },
        [EmailType.WELCOME_NOT_VERIFIED]: {
            subject: 'Welcome to Rentify - Verify Your Email',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .verification-box {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer { margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://s3.eu-north-1.amazonaws.com/bucket.satyam.dev/House+1.png" alt="Rentify">
                    </div>
                    <h2 style="color: #2c3e50; text-align: center;">Welcome to Rentify!</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>Thank you for joining Rentify! We're excited to have you as part of our community.</p>
                    
                    <div class="verification-box">
                        <h3>One Last Step!</h3>
                        <p>Please verify your email address to unlock all features:</p>
                        <center><a href="${payload.verificationUrl}" class="button">Verify Email</a></center>
                    </div>

                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #007bff;">${payload.verificationUrl}</p>

                    <div class="footer">
                        <p>If you need any assistance, our support team is always here to help.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },
        [EmailType.PASSWORD_RESET]: {
            subject: 'Reset Your Rentify Password',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .reset-box {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #dc3545;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .warning { color: #dc3545; font-size: 14px; }
                    .footer { margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://s3.eu-north-1.amazonaws.com/bucket.satyam.dev/House+1.png" alt="Rentify">
                    </div>
                    <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>We received a request to reset your Rentify password.</p>
                    
                    <div class="reset-box">
                        <p>Click the button below to reset your password:</p>
                        <center><a href="${payload.resetUrl}" class="button">Reset Password</a></center>
                        <p class="warning">This link will expire in 1 hour for security reasons.</p>
                    </div>

                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #007bff;">${payload.resetUrl}</p>

                    <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>

                    <div class="footer">
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        }
    }
    return values[key]
}