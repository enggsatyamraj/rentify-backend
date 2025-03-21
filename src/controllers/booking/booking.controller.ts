import { Request, Response } from "express";
import { IBooking } from "../../models/BookingModel/booking.interface";
import PropertyModel from "../../models/PropertyModel/property.models";
import logger from "../../utils/logger";
import mongoose from "mongoose";
import BookingModel from "../../models/BookingModel/booking.models";
import { sendEmail } from "../../utils/mailer";
import { EmailType } from "../../utils/enums";
import UserModel from "../../models/UserModel/user.models";
import { uploadImage } from "@/utils/upload";

class BookingService {
    static async createBooking(req: Request, res: Response) {
        // Use mongoose session for transaction support
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // @ts-ignore
            const userId = req.user.id;
            const { propertyId, startDate, endDate, bookingType, roomCount = 1 } = req.body;

            logger.info("Create booking request received", {
                userId,
                propertyId,
                startDate,
                bookingType,
                roomCount
            });

            // Validate user
            const user = await UserModel.findById(userId).session(session);
            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Validate property
            const property = await PropertyModel.findById(propertyId)
                .populate("owner", "email firstName lastName")
                .session(session);

            if (!property) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "Property not found",
                });
            }

            // Check if property is active and verified
            if (!property.status.isActive || !property.status.isVerified) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: "Property is not available for booking",
                });
            }

            // Check if property has enough available rooms
            if (property.details.availableRooms < roomCount) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Only ${property.details.availableRooms} rooms available, cannot book ${roomCount} rooms`,
                });
            }

            // Check if property is available from the requested date
            const availableFrom = new Date(property.availableFrom);
            const bookingStart = new Date(startDate);

            if (bookingStart < availableFrom) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Property is only available from ${availableFrom.toISOString().split('T')[0]}`,
                });
            }

            // Count overlapping bookings for the same date range
            const existingBookingsQuery = {
                property: propertyId,
                status: { $in: ["pending", "confirmed"] },
                $or: [
                    // Case 1: Requested start date falls within an existing booking
                    {
                        startDate: { $lte: bookingStart },
                        endDate: { $gte: bookingStart },
                    },
                    // Case 2: Requested end date falls within an existing booking
                    endDate && {
                        startDate: { $lte: new Date(endDate) },
                        endDate: { $gte: new Date(endDate) },
                    },
                    // Case 3: Booking encompasses an existing booking
                    endDate && {
                        startDate: { $gte: bookingStart },
                        endDate: { $lte: new Date(endDate) },
                    },
                    // Case 4: Month-to-month bookings with no end date that started before our start date
                    {
                        startDate: { $lte: bookingStart },
                        endDate: null,
                        bookingType: "month-to-month"
                    }
                ].filter(Boolean), // Filter out undefined if endDate is not provided
            };

            // Calculate total rooms already booked
            const bookings = await BookingModel.find(existingBookingsQuery).session(session);
            const totalRoomsBooked = bookings.reduce((sum, booking) => sum + (booking.roomCount || 1), 0);

            // Check if there are still enough rooms available
            if (totalRoomsBooked + roomCount > property.details.totalRooms) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Not enough rooms available for the requested dates. Only ${property.details.totalRooms - totalRoomsBooked} rooms available.`,
                });
            }

            // Create new booking
            const newBooking = await BookingModel.create(
                [
                    {
                        property: propertyId,
                        tenant: userId,
                        owner: property.owner._id,
                        startDate: bookingStart,
                        endDate: endDate ? new Date(endDate) : undefined,
                        bookingType,
                        status: "pending",
                        roomCount: roomCount,
                        moveInDetails: {
                            scheduledDate: bookingStart,
                            status: "scheduled",
                        },
                    },
                ],
                { session }
            );

            // Update property availability
            await PropertyModel.findByIdAndUpdate(
                propertyId,
                {
                    $inc: { "details.availableRooms": -roomCount },
                    // If all rooms are now booked, mark property as rented
                    $set: {
                        "status.isRented": property.details.availableRooms <= roomCount,
                    },
                },
                { session }
            );

            // Send email notifications
            try {
                // To tenant
                await sendEmail({
                    to: user.email,
                    templateType: EmailType.BOOKING_CONFIRMATION,
                    payload: {
                        firstName: user.firstName,
                        propertyTitle: property.title,
                        bookingDate: bookingStart.toLocaleDateString(),
                        bookingId: newBooking[0]._id.toString(),
                        roomCount: roomCount,
                        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/bookings`
                    },
                });

                // To owner
                await sendEmail({
                    // @ts-ignore
                    to: property.owner.email,
                    templateType: EmailType.NEW_BOOKING_NOTIFICATION,
                    payload: {
                        // @ts-ignore
                        firstName: property.owner.firstName,
                        tenantName: `${user.firstName} ${user.lastName}`,
                        propertyTitle: property.title,
                        bookingDate: bookingStart.toLocaleDateString(),
                        bookingId: newBooking[0]._id.toString(),
                        roomCount: roomCount,
                        confirmUrl: `${process.env.FRONTEND_URL}/dashboard/owner/bookings/${newBooking[0]._id}/confirm`,
                        rejectUrl: `${process.env.FRONTEND_URL}/dashboard/owner/bookings/${newBooking[0]._id}/reject`
                    },
                });
            } catch (emailError) {
                // Log email errors but don't fail the transaction
                logger.error("Failed to send booking emails:", emailError);
            }

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            res.status(201).json({
                success: true,
                message: "Booking created successfully",
                data: newBooking[0],
            });
        } catch (error) {
            // Abort transaction on any error
            await session.abortTransaction();
            session.endSession();

            logger.error("Create booking error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error,
            });
        }
    }

    static async updateBookingStatus(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { id } = req.params; // this is a booking id
            const { status, reason, scheduledDate } = req.body;

            // @ts-ignore
            const userId = req.user.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking id"
                })
            }

            const booking = await BookingModel.findById(id)
                .populate({
                    path: "property",
                    select: "title details.availableRooms status"
                })
                .populate({
                    path: "tenant",
                    select: "firstName lastName email",
                })
                .populate({
                    path: "owner",
                    select: "firstName lastName email"
                })
                .session(session);

            if (!booking) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                })
            }

            const isOwner = booking.owner._id.toString() === userId;
            const isTenant = booking.tenant._id.toString() === userId;

            // @ts-ignore
            const isAdmin = req.user.isAdmin;

            if (!isOwner && !isTenant && isAdmin) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: "You dont have permission to update the booking"
                })
            }

            const validTransitions: Record<string, string[]> = {
                pending: ["confirmed", "cancelled", "rejected"],
                confirmed: ["completed", "cancelled"],
                cancelled: [],
                completed: [],
                rejected: []
            }

            if (!validTransitions[booking.status].includes(status)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Cannot change booking status from ${booking.status} to ${status}`
                })
            }

            if (status === 'confirmed' && !isOwner && !isAdmin) {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({
                    success: false,
                    message: "Only property owner can confirm bookings"
                })
            }

            if (status === 'rejected' && !isOwner && !isAdmin) {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({
                    success: false,
                    message: "Only property owner can reject bookings"
                })
            }

            const updateData: any = { status };

            if (status === 'cancelled' || status === 'rejected') {
                updateData.cancellationDetails = {
                    cancelledBy: userId,
                    cancelledAt: new Date(),
                    reason: reason || "No reason provided"
                }

                // Increase the available rooms count
                await PropertyModel.findByIdAndUpdate(
                    booking.property._id,
                    {
                        $inc: { "details.availableRooms": 1 },
                        $set: {
                            "status.isRented": false,
                        }
                    },
                    { session }
                )
            }

            if (status === 'confirmed' && scheduledDate) {
                updateData["moveInDetails.scheduledDate"] = new Date(scheduledDate);
            }

            const updatedBooking = await BookingModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, session }
            )

            try {
                let emailType: EmailType;
                let recipientField: "tenant" | "owner" = "tenant";

                switch (status) {
                    case "confirmed":
                        emailType = EmailType.BOOKING_CONFIRMED;
                        break;
                    case "cancelled":
                        emailType = EmailType.BOOKING_CANCELLED;
                        recipientField = isTenant ? "owner" : "tenant";
                        break;
                    case "rejected":
                        emailType = EmailType.BOOKING_REJECTED;
                        break;
                    case "completed":
                        emailType = EmailType.BOOKING_COMPLETED;
                        break;
                    default:
                        emailType = EmailType.BOOKING_UPDATED;
                }

                await sendEmail({
                    // @ts-ignore
                    to: booking[recipientField].email,
                    templateType: emailType,
                    payload: {
                        // @ts-ignore
                        firstName: booking[recipientField].firstName,
                        // @ts-ignore
                        propertyTitle: booking.property.title,
                        bookingId: booking._id.toString(),
                        status,
                        reason: reason || undefined,
                    },
                });
            } catch (emailError) {
                logger.error("Failed to send booking status update email: ", emailError);
            }

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                success: true,
                message: `Booking ${status} successfully`,
                data: updatedBooking,
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error
            })
        }
    }

    static async getUserBookings(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const { status } = req.query;

            const query: any = { tenant: userId };

            // Filter by status if provided
            if (status && ["pending", "confirmed", "cancelled", "completed", "rejected"].includes(status as string)) {
                query.status = status;
            }

            const bookings = await BookingModel.find(query)
                .populate({
                    path: "property",
                    select: "title description propertyType price location details images status",
                })
                .populate({
                    path: "owner",
                    select: "firstName lastName email phoneNumber profileImage",
                })
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Bookings fetched successfully",
                count: bookings.length,
                data: bookings,
            });
        } catch (error) {
            logger.error("Get user bookings error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error,
            });
        }
    }

    /**
     * Get property bookings (as owner)
     */
    static async getPropertyBookings(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const { propertyId } = req.params;
            const { status } = req.query;

            if (!mongoose.Types.ObjectId.isValid(propertyId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid property ID",
                });
            }

            // Check if user is the property owner
            const property = await PropertyModel.findById(propertyId);

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: "Property not found",
                });
            }

            // @ts-ignore
            if (property.owner.toString() !== userId && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view these bookings",
                });
            }

            const query: any = { property: propertyId };

            // Filter by status if provided
            if (status && ["pending", "confirmed", "cancelled", "completed", "rejected"].includes(status as string)) {
                query.status = status;
            }

            const bookings = await BookingModel.find(query)
                .populate({
                    path: "tenant",
                    select: "firstName lastName email phoneNumber profileImage",
                })
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Property bookings fetched successfully",
                count: bookings.length,
                data: bookings,
            });
        } catch (error) {
            logger.error("Get property bookings error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error,
            });
        }
    }

    /**
     * Get booking details by ID
     */
    static async getBookingById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking ID",
                });
            }

            const booking = await BookingModel.findById(id)
                .populate({
                    path: "property",
                    select: "title description propertyType price location details images status rules foodAvailable maintainenceCharges",
                })
                .populate({
                    path: "tenant",
                    select: "firstName lastName email phoneNumber profileImage",
                })
                .populate({
                    path: "owner",
                    select: "firstName lastName email phoneNumber profileImage",
                });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }

            // Check if user is tenant, owner, or admin
            const isTenant = booking.tenant._id.toString() === userId;
            const isOwner = booking.owner._id.toString() === userId;
            // @ts-ignore
            const isAdmin = req.user.isAdmin;

            if (!isTenant && !isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this booking",
                });
            }

            res.status(200).json({
                success: true,
                message: "Booking fetched successfully",
                data: booking,
            });
        } catch (error) {
            logger.error("Get booking error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error,
            });
        }
    }

    /**
     * Update move-in details
     */
    static async updateMoveInDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { scheduledDate, status, notes } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking ID",
                });
            }

            const booking = await BookingModel.findById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }

            // Only allow updating move-in details for confirmed bookings
            if (booking.status !== "confirmed") {
                return res.status(400).json({
                    success: false,
                    message: "Can only update move-in details for confirmed bookings",
                });
            }

            // Check permissions (both tenant and owner can update)
            const isTenant = booking.tenant.toString() === userId;
            const isOwner = booking.owner.toString() === userId;
            // @ts-ignore
            const isAdmin = req.user.isAdmin;

            if (!isTenant && !isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to update this booking",
                });
            }

            // Update move-in details
            const updateData: any = { "moveInDetails.updatedBy": userId };

            if (scheduledDate) {
                updateData["moveInDetails.scheduledDate"] = new Date(scheduledDate);
            }

            if (status && ["scheduled", "completed", "cancelled"].includes(status)) {
                updateData["moveInDetails.status"] = status;
            }

            if (notes) {
                updateData["moveInDetails.notes"] = notes;
            }

            const updatedBooking = await BookingModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );

            // If move-in is completed, update booking status to completed
            if (status === "completed") {
                await BookingModel.findByIdAndUpdate(
                    id,
                    { $set: { status: "completed" } }
                );
            }

            res.status(200).json({
                success: true,
                message: "Move-in details updated successfully",
                data: updatedBooking,
            });
        } catch (error) {
            logger.error("Update move-in details error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error,
            });
        }
    }

    /**
 * Update contract details
 * Handles contract document upload and signing by both parties
 */
    static async updateContractDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;
            const { signedByTenant, signedByOwner } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking ID",
                });
            }

            const booking = await BookingModel.findById(id)
                .populate({
                    path: "property",
                    select: "title",
                })
                .populate({
                    path: "tenant",
                    select: "firstName lastName email",
                })
                .populate({
                    path: "owner",
                    select: "firstName lastName email",
                });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }

            // Check if booking is confirmed - only confirmed bookings can have contracts
            if (booking.status !== "confirmed") {
                return res.status(400).json({
                    success: false,
                    message: "Contracts can only be added to confirmed bookings",
                });
            }

            // Check if user is tenant, owner, or admin
            const isTenant = booking.tenant._id.toString() === userId;
            const isOwner = booking.owner._id.toString() === userId;
            // @ts-ignore
            const isAdmin = req.user.isAdmin;

            if (!isTenant && !isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to update this booking",
                });
            }

            // Handle contract document upload if file is provided
            let documentUrl;
            if (req.file) {
                // Only owner or admin can upload contract document
                if (!isOwner && !isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: "Only property owner can upload contract documents",
                    });
                }

                try {
                    // Upload document to S3
                    const result = await uploadImage(
                        'contracts',
                        `contract-${id}-${Date.now()}`,
                        req.file,
                        false // Don't resize contract documents
                    );
                    documentUrl = result.url;
                } catch (error) {
                    logger.error("Contract document upload failed:", error);
                    return res.status(400).json({
                        success: false,
                        message: "Failed to upload contract document",
                    });
                }
            }

            // Prepare update data
            const updateData: any = {};

            // Set document URL if uploaded
            if (documentUrl) {
                updateData["contractDetails.documentUrl"] = documentUrl;

                // Send email notification about contract document
                try {
                    await sendEmail({
                        to: booking.tenant.email,
                        templateType: EmailType.CONTRACT_READY,
                        payload: {
                            firstName: booking.tenant.firstName,
                            propertyTitle: booking.property.title,
                            bookingId: booking._id.toString(),
                            startDate: booking.startDate.toLocaleDateString(),
                            endDate: booking.endDate ? booking.endDate.toLocaleDateString() : undefined,
                            contractUrl: `${process.env.FRONTEND_URL}/dashboard/bookings/${booking._id}/contract`
                        },
                    });
                } catch (emailError) {
                    logger.error("Failed to send contract email:", emailError);
                    // Don't fail the update if the email fails
                }
            }

            // Set signature status based on role
            if (isTenant && signedByTenant === true) {
                updateData["contractDetails.signedByTenant"] = true;

                // Check if contract document exists
                if (!booking.contractDetails?.documentUrl && !documentUrl) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot sign contract: No contract document has been uploaded yet",
                    });
                }
            }

            if (isOwner && signedByOwner === true) {
                updateData["contractDetails.signedByOwner"] = true;

                // Check if contract document exists
                if (!booking.contractDetails?.documentUrl && !documentUrl) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot sign contract: No contract document has been uploaded yet",
                    });
                }
            }

            // If no updates were specified
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No contract updates provided",
                });
            }

            // Check if both parties will be signed after this update
            const willBothBeSigned =
                (booking.contractDetails?.signedByTenant || updateData["contractDetails.signedByTenant"]) &&
                (booking.contractDetails?.signedByOwner || updateData["contractDetails.signedByOwner"]);

            // If both signatures will be complete, update the signedAt timestamp
            if (willBothBeSigned) {
                updateData["contractDetails.signedAt"] = new Date();
            }

            // Update the contract details
            const updatedBooking = await BookingModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            )
                .populate({
                    path: "property",
                    select: "title description propertyType price location details images",
                })
                .populate({
                    path: "tenant",
                    select: "firstName lastName email phoneNumber profileImage",
                })
                .populate({
                    path: "owner",
                    select: "firstName lastName email phoneNumber profileImage",
                });

            // Send notification if contract is fully signed
            if (willBothBeSigned && !booking.contractDetails?.signedAt) {
                try {
                    // Notify both parties
                    await sendEmail({
                        to: booking.tenant.email,
                        templateType: EmailType.BOOKING_UPDATED,
                        payload: {
                            firstName: booking.tenant.firstName,
                            propertyTitle: booking.property.title,
                            bookingId: booking._id.toString(),
                            updateType: "Contract signed by both parties",
                            viewDetailsUrl: `${process.env.FRONTEND_URL}/dashboard/bookings/${booking._id}`
                        },
                    });

                    await sendEmail({
                        to: booking.owner.email,
                        templateType: EmailType.BOOKING_UPDATED,
                        payload: {
                            firstName: booking.owner.firstName,
                            propertyTitle: booking.property.title,
                            bookingId: booking._id.toString(),
                            updateType: "Contract signed by both parties",
                            viewDetailsUrl: `${process.env.FRONTEND_URL}/dashboard/owner/bookings/${booking._id}`
                        },
                    });
                } catch (emailError) {
                    logger.error("Failed to send contract completion email:", emailError);
                }
            }

            res.status(200).json({
                success: true,
                message: "Contract details updated successfully",
                data: updatedBooking,
            });
        } catch (error) {
            logger.error("Update contract details error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error,
            });
        }
    }
}

export default BookingService;