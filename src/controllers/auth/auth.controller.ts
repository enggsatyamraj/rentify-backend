import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


import UserModel from "@/models/UserModel/user.models";
import { EmailType } from "@/utils/enums";
import { sendEmail } from "@/utils/mailer";

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
                    return res.status(400).json({
                        success: false,
                        message: "Your email is not verified, so please verify your email"
                    })
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
                isVerified: false,
                isDeleted: false
            });

            await sendEmail({
                to: email,
                templateType: EmailType.OTP_VERIFICATION,
                payload: { firstName, otp }
            });

            // await sendEmail({
            //     to: email,
            //     templateType: EmailType.WELCOME_NOT_VERIFIED,
            //     payload: {
            //         firstName,
            //         verificationUrl: `${process.env.FRONTEND_URL}/verify?email=${email}`
            //     }
            // });

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
                isDeleted: false,
                isVerified: false
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found or already verified"
                });
            }

            if (!user.otp) {
                return res.status(400).json({
                    success: false,
                    message: "OTP expired. Please request a new OTP"
                });
            }

            if (user.otp !== otp) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP"
                });
            }

            // Update directly using findOneAndUpdate
            await UserModel.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: { isVerified: true },
                    $unset: { otp: "" }
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
            user.otp = otp;
            await user.save();

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
}

export default AuthController;