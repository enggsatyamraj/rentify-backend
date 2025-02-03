import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserModel from "@/models/UserModel/user.models";
import { EmailType } from "@/utils/enums";
import { sendEmail } from "@/utils/mailer";
import logger from "@/utils/logger";
import { validateVerhoeff } from "../../utils/verhoeff_algorithm";
import { deleteImage, uploadImage } from "../../utils/upload";

class AuthController {
    static async signup(req: Request, res: Response) {
        try {
            const { email, password, firstName, lastName, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Passwords do not match"
                });
            }

            const existingUser = await UserModel.findOne({ email, isDeleted: false });
            if (existingUser) {
                if (existingUser.isVerified) {
                    return res.status(400).json({
                        success: false,
                        message: "User already exists, please login"
                    })
                } else {
                    logger.info("Resending OTP to existing user", { email });
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

                    // Update user with new OTP and expiry
                    await UserModel.findOneAndUpdate(
                        { _id: existingUser._id },
                        {
                            $set: {
                                otp: newOtp,
                                otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                                firstName, // Update with new details if provided
                                lastName
                            }
                        }
                    );

                    // Send new OTP email
                    await sendEmail({
                        to: email,
                        templateType: EmailType.OTP_VERIFICATION,
                        payload: { firstName, otp: newOtp }
                    });

                    return res.status(200).json({
                        success: true,
                        message: "A new verification code has been sent to your email",
                        userId: existingUser._id
                    });
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const user = await UserModel.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                otp,
                otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                isVerified: false,
                isDeleted: false
            });

            await sendEmail({
                to: email,
                templateType: EmailType.OTP_VERIFICATION,
                payload: { firstName, otp }
            });

            res.status(201).json({
                success: true,
                message: "User registered successfully. Please verify your email address",
                userId: user._id
            });

        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async verify(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;

            const user = await UserModel.findOne({
                email,
                otp,
                otpExpiry: { $gt: new Date() }, // Check if OTP hasn't expired
                isDeleted: false,
                isVerified: false
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired verification code. Please request a new one."
                });
            }

            // Update user status and remove OTP
            await UserModel.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: { isVerified: true },
                    $unset: { otp: "", otpExpiry: "" }
                }
            );

            await sendEmail({
                to: email,
                templateType: EmailType.WELCOME_VERIFIED,
                payload: {
                    firstName: user.firstName,
                    loginUrl: `${process.env.FRONTEND_URL}/login`
                }
            });

            return res.status(200).json({
                success: true,
                message: "Email verified successfully. Please login to continue"
            });

        } catch (error) {
            console.error("Verification error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body;

            const user = await UserModel.findOne({
                email,
                isDeleted: false,
                isVerified: false
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found or already verified"
                });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Update with new OTP and expiry
            await UserModel.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        otp: otp,
                        otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                    }
                }
            );

            await sendEmail({
                to: email,
                templateType: EmailType.OTP_VERIFICATION,
                payload: { firstName: user.firstName, otp }
            });

            res.status(200).json({
                success: true,
                message: "New OTP sent successfully"
            });

        } catch (error) {
            console.error("Resend OTP error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async signin(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findOne({
                email,
                isDeleted: false
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email first"
                });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET as string,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                success: true,
                message: "Logged in successfully",
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });

        } catch (error) {
            console.error("Signin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            logger.info("Forgot password request received", { email });

            const user = await UserModel.findOne({ email, isDeleted: false, isVerified: true });
            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: "User don't exist with this email or its account is not verified."
                });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Update user with new OTP and expiry
            await UserModel.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        otp: otp,
                        otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                    }
                }
            );

            await sendEmail({
                to: email,
                templateType: EmailType.RESET_PASSWORD_OTP,
                payload: {
                    firstName: user.firstName,
                    otp
                }
            });

            return res.status(200).json({
                success: true,
                message: "If a user exists with this email, they will receive a password reset code."
            });

        } catch (error) {
            logger.error("Forgot password error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { email, otp, newPassword } = req.body;
            logger.info("Reset password request received", { email });

            const user = await UserModel.findOne({
                email,
                otp,
                otpExpiry: { $gt: new Date() }, // Check if OTP hasn't expired
                isDeleted: false
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired reset code. Please request a new one."
                });
            }

            // Hash new password
            const newHashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password and remove OTP data
            await UserModel.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: { password: newHashedPassword },
                    $unset: { otp: "", otpExpiry: "" }
                }
            );

            // Send confirmation email
            await sendEmail({
                to: email,
                templateType: EmailType.PASSWORD_RESET_SUCCESS,
                payload: {
                    firstName: user.firstName,
                    loginUrl: `${process.env.FRONTEND_URL}/login`
                }
            });

            logger.info("Password reset successful", { email });
            return res.status(200).json({
                success: true,
                message: "Password reset successfully. Please login with your new password."
            });

        } catch (error) {
            logger.error("Reset password error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id; // From auth middleware
            console.log('userId:', userId);
            logger.info("Profile update request received", { userId });
            const {
                firstName,
                lastName,
                phoneNumber,
                dateOfBirth,
                aadharNumber,
                address
            } = req.body;

            // Find existing user
            const existingUser = await UserModel.findById(userId);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Handle profile image upload if present
            let profileImageData = undefined;
            if (req.file) {
                try {
                    // Delete old image if exists
                    if (existingUser.profileImage) {
                        const oldImageKey = existingUser.profileImage.split('/').pop();
                        if (oldImageKey) {
                            await deleteImage(`rentify/profiles/${oldImageKey}`);
                        }
                    }

                    // Upload new image
                    const { url } = await uploadImage(
                        'profiles',
                        `${userId}_${Date.now()}`,
                        req.file,
                        true // Enable resize
                    );
                    profileImageData = url;
                } catch (error) {
                    logger.error('Profile image upload failed:', error);
                    return res.status(400).json({
                        success: false,
                        message: "Failed to upload profile image"
                    });
                }
            }

            // Validate phone number if provided
            if (phoneNumber) {
                // Check if phone number is already in use by another user
                const existingPhone = await UserModel.findOne({
                    phoneNumber,
                    _id: { $ne: userId }, // Exclude current user
                    isDeleted: false
                });

                if (existingPhone) {
                    return res.status(400).json({
                        success: false,
                        message: "This phone number is already registered with another account"
                    });
                }
            }

            // Validate Aadhar number if provided
            if (aadharNumber) {
                // First check the basic format
                if (!/^\d{12}$/.test(aadharNumber)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid Aadhar number format. Must be 12 digits."
                    });
                }

                // Then validate using Verhoeff algorithm
                if (!validateVerhoeff(aadharNumber)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid Aadhar number. Failed checksum validation."
                    });
                }

                // Check if Aadhar is already in use by another user
                const existingAadhar = await UserModel.findOne({
                    aadharNumber,
                    _id: { $ne: userId },
                    isDeleted: false
                });

                if (existingAadhar) {
                    return res.status(400).json({
                        success: false,
                        message: "This Aadhar number is already registered with another account"
                    });
                }
            }

            // Prepare update object
            const updateData: any = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (phoneNumber) updateData.phoneNumber = phoneNumber;
            if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
            if (profileImageData) updateData.profileImage = profileImageData;
            if (aadharNumber) {
                updateData.aadharNumber = aadharNumber;
                updateData.aadharVerified = false; // Reset verification on new number
            }
            if (address) {
                updateData.address = {
                    street: address.street,
                    city: address.city,
                    region: address.region,
                    country: address.country,
                    postalCode: address.postalCode,
                    coordinates: address.coordinates
                };
            }

            // Update user profile
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, select: '-password -otp -otpExpiry' }
            );

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser
            });

        } catch (error) {
            logger.error("Profile update error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default AuthController;