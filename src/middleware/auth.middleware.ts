import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { upload } from "../utils/upload";
import UserModel from "@/models/UserModel/user.models";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token, access denied"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        // Get user from database
        const user = await UserModel.findOne({
            _id: decoded.userId,
            isDeleted: false
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Add user to request
        // @ts-ignore
        req.user = { id: user._id.toString() };
        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Token is invalid"
        });
    }
};

// Handle property images upload
export const propertyImagesUpload = upload.array('images', 10); // Max 10 images

// Ensure user is verified for property actions
export const ensureVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.phoneNumber || !user.aadharVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your phone number and Aadhar to perform this action"
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};