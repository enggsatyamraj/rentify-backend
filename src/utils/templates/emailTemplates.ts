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
        [EmailType.RESET_PASSWORD_OTP]: {
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
                    <h2 style="color: #2c3e50; text-align: center;">Reset Your Password</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>We received a request to reset your password. Use the following code to reset your password:</p>
                    <div class="otp-box">
                        <strong>${payload.otp}</strong>
                    </div>
                    <p style="color: #dc3545;"><strong>This code will expire in a few minutes.</strong></p>
                    <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
                    <div class="footer">
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },
        [EmailType.PASSWORD_RESET_SUCCESS]: {
            subject: 'Password Reset Successful - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
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
                    <h2 style="color: #2c3e50; text-align: center;">Password Reset Successful</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>Your password has been successfully reset.</p>
                    <center><a href="${payload.loginUrl}" class="button">Login Now</a></center>
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    <div class="footer">
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        // New email templates for booking functionality
        [EmailType.BOOKING_CONFIRMATION]: {
            subject: 'Booking Request Received - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .booking-id {
                        background: #e9ecef;
                        padding: 10px;
                        text-align: center;
                        border-radius: 5px;
                        font-family: monospace;
                        margin: 10px 0;
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
                    <h2 style="color: #2c3e50; text-align: center;">Booking Request Received</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>We've received your booking request for <strong>${payload.propertyTitle}</strong>. The property owner will review your request shortly.</p>
                    
                    <div class="booking-box">
                        <h3>Booking Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking Date:</strong> ${payload.bookingDate}</p>
                        <p><strong>Booking ID:</strong></p>
                        <div class="booking-id">${payload.bookingId}</div>
                        <p>Please save this booking ID for future reference.</p>
                    </div>
                    
                    <p>The property owner will review your request and confirm your booking soon. You'll receive another email once your booking is confirmed.</p>
                    
                    <center><a href="${payload.dashboardUrl || '#'}" class="button">View Booking Status</a></center>
                    
                    <div class="footer">
                        <p>If you have any questions about your booking, please contact our support team.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.NEW_BOOKING_NOTIFICATION]: {
            subject: 'New Booking Request - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 10px 5px;
                    }
                    .button-reject {
                        background: #dc3545;
                    }
                    .footer { margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://s3.eu-north-1.amazonaws.com/bucket.satyam.dev/House+1.png" alt="Rentify">
                    </div>
                    <h2 style="color: #2c3e50; text-align: center;">New Booking Request</h2>
                    <p>Hello ${payload.firstName},</p>
                    <p>You have received a new booking request for your property <strong>${payload.propertyTitle}</strong>.</p>
                    
                    <div class="booking-box">
                        <h3>Booking Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Tenant:</strong> ${payload.tenantName}</p>
                        <p><strong>Start Date:</strong> ${payload.bookingDate}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                    </div>
                    
                    <p>Please review this request and take action as soon as possible. The tenant is waiting for your response.</p>
                    
                    <center>
                        <a href="${payload.confirmUrl || '#'}" class="button">Confirm Booking</a>
                        <a href="${payload.rejectUrl || '#'}" class="button button-reject">Reject Booking</a>
                    </center>
                    
                    <div class="footer">
                        <p>You can also manage all your bookings from your dashboard.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.BOOKING_CONFIRMED]: {
            subject: 'Booking Confirmed! - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .success-banner {
                        background: #28a745;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
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
                    <div class="success-banner">
                        <h2 style="margin: 0;">Booking Confirmed!</h2>
                    </div>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>Great news! Your booking for <strong>${payload.propertyTitle}</strong> has been confirmed by the property owner.</p>
                    
                    <div class="booking-box">
                        <h3>Booking Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                        <p><strong>Move-in Date:</strong> ${payload.moveInDate || payload.bookingDate}</p>
                    </div>
                    
                    <p>What's next?</p>
                    <ol>
                        <li>The property owner will contact you to discuss move-in arrangements</li>
                        <li>Prepare any necessary documents mentioned in the property listing</li>
                        <li>Review the contract details which will be shared soon</li>
                    </ol>
                    
                    <center><a href="${payload.viewDetailsUrl || '#'}" class="button">View Booking Details</a></center>
                    
                    <div class="footer">
                        <p>If you have any questions, please contact the property owner or our support team.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.BOOKING_REJECTED]: {
            subject: 'Booking Update - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .status-banner {
                        background: #dc3545;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
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
                    <div class="status-banner">
                        <h2 style="margin: 0;">Booking Not Confirmed</h2>
                    </div>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>We regret to inform you that your booking request for <strong>${payload.propertyTitle}</strong> was not confirmed by the property owner.</p>
                    
                    <div class="booking-box">
                        <h3>Booking Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                        ${payload.reason ? `<p><strong>Reason:</strong> ${payload.reason}</p>` : ''}
                    </div>
                    
                    <p>Don't worry! There are many other great properties available on Rentify that might suit your needs better.</p>
                    
                    <center><a href="${payload.searchUrl || '#'}" class="button">Browse More Properties</a></center>
                    
                    <div class="footer">
                        <p>If you have any questions, please contact our support team.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.BOOKING_CANCELLED]: {
            subject: 'Booking Cancelled - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .status-banner {
                        background: #ffc107;
                        color: #212529;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
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
                    <div class="status-banner">
                        <h2 style="margin: 0;">Booking Cancelled</h2>
                    </div>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>The booking for <strong>${payload.propertyTitle}</strong> has been cancelled.</p>
                    
                    <div class="booking-box">
                        <h3>Booking Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                        ${payload.reason ? `<p><strong>Reason:</strong> ${payload.reason}</p>` : ''}
                    </div>
                    
                    <p>If you have any questions about this cancellation, please contact our support team.</p>
                    
                    <center><a href="${payload.dashboardUrl || '#'}" class="button">Go to Dashboard</a></center>
                    
                    <div class="footer">
                        <p>Thank you for using Rentify.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.BOOKING_COMPLETED]: {
            subject: 'Booking Completed - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .status-banner {
                        background: #28a745;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
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
                    <div class="status-banner">
                        <h2 style="margin: 0;">Booking Completed</h2>
                    </div>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>Your booking for <strong>${payload.propertyTitle}</strong> has been successfully completed.</p>
                    
                    <div class="booking-box">
                        <h3>Booking Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                    </div>
                    
                    <p>We hope you had a great experience with this property. Would you like to share your feedback?</p>
                    
                    <center><a href="${payload.reviewUrl || '#'}" class="button">Write a Review</a></center>
                    
                    <div class="footer">
                        <p>Thank you for choosing Rentify for your housing needs.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.BOOKING_UPDATED]: {
            subject: 'Booking Update - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .booking-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .update-banner {
                        background: #17a2b8;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
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
                    <div class="update-banner">
                        <h2 style="margin: 0;">Booking Updated</h2>
                    </div>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>Your booking for <strong>${payload.propertyTitle}</strong> has been updated.</p>
                    
                    <div class="booking-box">
                        <h3>Updated Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                        ${payload.updateType ? `<p><strong>Update Type:</strong> ${payload.updateType}</p>` : ''}
                        ${payload.newDate ? `<p><strong>New Date:</strong> ${payload.newDate}</p>` : ''}
                        ${payload.notes ? `<p><strong>Notes:</strong> ${payload.notes}</p>` : ''}
                    </div>
                    
                    <p>Please review these changes and contact the property owner if you have any questions.</p>
                    
                    <center><a href="${payload.viewDetailsUrl || '#'}" class="button">View Booking Details</a></center>
                    
                    <div class="footer">
                        <p>Thank you for using Rentify.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.CONTRACT_READY]: {
            subject: 'Your Rental Contract is Ready - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .document-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
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
                    <h2 style="color: #2c3e50; text-align: center;">Your Rental Contract is Ready</h2>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>The rental contract for <strong>${payload.propertyTitle}</strong> is now ready for your review and signature.</p>
                    
                    <div class="document-box">
                        <h3>Contract Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
                        <p><strong>Lease Start Date:</strong> ${payload.startDate}</p>
                        ${payload.endDate ? `<p><strong>Lease End Date:</strong> ${payload.endDate}</p>` : ''}
                    </div>
                    
                    <p>Please review the contract carefully. If you have any questions or need any clarification, please contact the property owner or our support team.</p>
                    
                    <center><a href="${payload.contractUrl || '#'}" class="button">View & Sign Contract</a></center>
                    
                    <div class="footer">
                        <p>Thank you for choosing Rentify for your housing needs.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        },

        [EmailType.MOVE_IN_REMINDER]: {
            subject: 'Move-in Reminder - Rentify',
            html: `
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                    .logo { text-align: center; margin-bottom: 20px; }
                    .logo img { max-width: 150px; }
                    .reminder-box { 
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e9ecef;
                    }
                    .reminder-banner {
                        background: #007bff;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 5px;
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
                    <div class="reminder-banner">
                        <h2 style="margin: 0;">Move-in Day is Coming Soon!</h2>
                    </div>
                    
                    <p>Hello ${payload.firstName},</p>
                    <p>This is a friendly reminder that your move-in date for <strong>${payload.propertyTitle}</strong> is coming up soon.</p>
                    
                    <div class="reminder-box">
                        <h3>Move-in Details:</h3>
                        <p><strong>Property:</strong> ${payload.propertyTitle}</p>
                        <p><strong>Move-in Date:</strong> ${payload.moveInDate}</p>
                        <p><strong>Address:</strong> ${payload.address}</p>
                        ${payload.notes ? `<p><strong>Additional Notes:</strong> ${payload.notes}</p>` : ''}
                    </div>
                    
                    <p>To ensure a smooth move-in process, please make sure you have:</p>
                    <ul>
                        <li>Signed all necessary documents</li>
                        <li>Arranged for moving assistance if needed</li>
                        <li>Contacted utility providers if applicable</li>
                        <li>Prepared your security deposit and first month's rent</li>
                    </ul>
                    
                    <center><a href="${payload.viewDetailsUrl || '#'}" class="button">View Booking Details</a></center>
                    
                    <div class="footer">
                        <p>If you need to reschedule or have any questions, please contact the property owner or our support team as soon as possible.</p>
                        <p>Best regards,<br>The Rentify Team</p>
                    </div>
                </div>
            </body>
            </html>`
        }
    }
    return values[key]
}