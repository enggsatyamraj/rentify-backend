
import PropertyModel from "../../models/PropertyModel/property.models";
import UserModel from "../../models/UserModel/user.models";
import logger from "../../utils/logger";
import { uploadImage } from "../../utils/upload";
import { Request, Response } from "express";

class PropertyController {
    // Create a new property listing
    static async createProperty(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id; // Assuming this comes from auth middleware
            const files = req.files as Express.Multer.File[]; // Multiple images

            // Check if user exists and is verified
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Verify user has phone and aadhar
            if (!user.phoneNumber || !user.aadharNumber) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your phone number and Aadhar before listing a property"
                });
            }

            // Upload images
            const imageUploads = await Promise.all(files.map(async (file, index) => {
                const result = await uploadImage('properties', `${Date.now()}-${index}`, file, true);
                return {
                    key: result.key,
                    url: result.url,
                    isPrimary: index === 0 // First image is primary
                };
            }));

            // Create property
            const property = await PropertyModel.create({
                ...req.body,
                owner: userId,
                images: imageUploads,
                status: {
                    isActive: true,
                    isVerified: false,
                    isAvailable: true,
                    isFeatured: false
                }
            });

            // Add property to user's listings
            await UserModel.findByIdAndUpdate(userId, {
                $push: {
                    propertyListings: {
                        property: property._id,
                        listedAt: new Date()
                    }
                }
            });

            res.status(201).json({
                success: true,
                message: "Property listed successfully",
                data: property
            });

        } catch (error: any) {
            logger.error('Property creation error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all properties (with filters)
    static async getProperties(req: Request, res: Response) {
        try {
            const {
                city,
                propertyType,
                minPrice,
                maxPrice,
                roomType,
                furnishingStatus,
                preferredTenants,
                page = 1,
                limit = 10
            } = req.query;

            const query: any = {
                'status.isActive': true,
                'status.isAvailable': true
            };

            // Apply filters
            if (city) query['location.city'] = new RegExp(city as string, 'i');
            if (propertyType) query.propertyType = propertyType;
            if (roomType) query['details.roomType'] = roomType;
            if (furnishingStatus) query['details.furnishingStatus'] = furnishingStatus;
            if (preferredTenants) query.preferredTenants = preferredTenants;
            if (minPrice) query['price.basePrice'] = { $gte: Number(minPrice) };
            if (maxPrice) query['price.basePrice'] = { ...query['price.basePrice'], $lte: Number(maxPrice) };

            const skip = (Number(page) - 1) * Number(limit);

            const properties = await PropertyModel.find(query)
                .populate('owner', 'firstName lastName')
                .skip(skip)
                .limit(Number(limit))
                .sort('-createdAt');

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

        } catch (error: any) {
            logger.error('Get properties error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get property by ID
    static async getPropertyById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const property = await PropertyModel.findById(id)
                .populate('owner', 'firstName lastName phoneNumber');

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found"
                });
            }

            // Increment view count
            await PropertyModel.findByIdAndUpdate(id, {
                $inc: { 'metaData.views': 1 }
            });

            res.status(200).json({
                success: true,
                data: property
            });

        } catch (error: any) {
            logger.error('Get property error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update property
    static async updateProperty(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;
            const files = req.files as Express.Multer.File[];

            // Check property exists and user owns it
            const property = await PropertyModel.findOne({
                _id: id,
                owner: userId
            });

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or you don't have permission to update"
                });
            }

            // Handle new images if any
            if (files && files.length > 0) {
                const newImages = await Promise.all(files.map(async (file, index) => {
                    const result = await uploadImage('properties', `${Date.now()}-${index}`, file, true);
                    return {
                        key: result.key,
                        url: result.url,
                        isPrimary: false
                    };
                }));

                // Add new images to existing ones
                req.body.images = [...property.images, ...newImages];
            }

            const updatedProperty = await PropertyModel.findByIdAndUpdate(
                id,
                { $set: req.body },
                { new: true }
            );

            res.status(200).json({
                success: true,
                message: "Property updated successfully",
                data: updatedProperty
            });

        } catch (error: any) {
            logger.error('Update property error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Delete property
    static async deleteProperty(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            // Check property exists and user owns it
            const property = await PropertyModel.findOne({
                _id: id,
                owner: userId
            });

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found or you don't have permission to delete"
                });
            }

            // Soft delete by making it inactive
            await PropertyModel.findByIdAndUpdate(id, {
                'status.isActive': false
            });

            // Remove from user's listings
            await UserModel.findByIdAndUpdate(userId, {
                $pull: {
                    propertyListings: {
                        property: id
                    }
                }
            });

            res.status(200).json({
                success: true,
                message: "Property deleted successfully"
            });

        } catch (error: any) {
            logger.error('Delete property error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Toggle favorite property
    static async toggleFavorite(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            const property = await PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found"
                });
            }

            // Update favorite count
            await PropertyModel.findByIdAndUpdate(id, {
                $inc: { 'metaData.favoriteCount': 1 }
            });

            res.status(200).json({
                success: true,
                message: "Property added to favorites"
            });

        } catch (error: any) {
            logger.error('Toggle favorite error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get properties listed by the current user
    static async getUserProperties(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id;

            // Find the user and populate their property listings
            const user = await UserModel.findById(userId)
                .populate({
                    path: 'propertyListings.property',
                    match: { 'status.isActive': true }, // Only get active properties
                    populate: {
                        path: 'owner',
                        select: 'firstName lastName phoneNumber'
                    }
                })
                .select('propertyListings');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Filter out any null properties (in case some were deleted)
            const properties = user.propertyListings
                // @ts-ignore
                .filter(listing => listing.property !== null)
                // @ts-ignore
                .map(listing => ({
                    ...listing.property.toObject(),
                    listedAt: listing.listedAt
                }));

            res.status(200).json({
                success: true,
                message: "Properties fetched successfully",
                data: properties
            });

        } catch (error: any) {
            logger.error('Get user properties error:', error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default PropertyController;