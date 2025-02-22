// controllers/AdminController.ts
import { Request, Response } from "express";
import PropertyModel from "../models/PropertyModel/property.models";
import logger from "../utils/logger";

class AdminController {
    // Get all properties for admin
    static async getAllProperties(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, isVerified } = req.query;

            const query: any = {
                'status.isActive': true
            };

            // Add verification filter if provided
            if (isVerified !== undefined) {
                query['status.isVerified'] = isVerified === 'true';
            }

            const skip = (Number(page) - 1) * Number(limit);

            const properties = await PropertyModel.find(query)
                .populate('owner', 'firstName lastName email phoneNumber')
                .sort('-createdAt')
                .skip(skip)
                .limit(Number(limit));

            const total = await PropertyModel.countDocuments(query);

            res.status(200).json({
                success: true,
                data: properties,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit))
                }
            });

        } catch (error) {
            logger.error('Admin get all properties error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Toggle property verification status
    static async togglePropertyVerification(req: Request, res: Response) {
        try {
            const { propertyId } = req.params;
            const { isVerified } = req.body;

            // Validate isVerified
            if (typeof isVerified !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: "isVerified must be a boolean value"
                });
            }

            const property = await PropertyModel.findById(propertyId);

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found"
                });
            }

            // Update verification status
            const updatedProperty = await PropertyModel.findByIdAndUpdate(
                propertyId,
                {
                    $set: {
                        'status.isVerified': isVerified
                    }
                },
                { new: true }
            ).populate('owner', 'firstName lastName email');

            res.status(200).json({
                success: true,
                message: `Property ${isVerified ? 'verified' : 'unverified'} successfully`,
                data: updatedProperty
            });

        } catch (error) {
            logger.error('Toggle property verification error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default AdminController;