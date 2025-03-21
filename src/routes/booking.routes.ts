// src/routes/booking.routes.ts
import { NextFunction, Router } from "express";
import BookingController from "../controllers/booking/booking.controller";
import { auth } from "../middleware/auth.middleware";
import catchAsync from "../utils/catchAsync";
import { validateSchema } from "../utils/validate";
import { createBookingSchema, updateBookingStatusSchema, updateContractDetailsSchema, updateMoveInDetailsSchema } from "../utils/validators/booking.validation";
import { upload } from "@/utils/upload";

const contractUpload = upload.single('contractDocument');

class BookingRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Create a new booking
        this.router.post(
            "/",
            // @ts-ignore
            auth,
            validateSchema(createBookingSchema),
            catchAsync(BookingController.createBooking)
        );

        // Update booking status (confirm, cancel, reject)
        this.router.patch(
            "/:id/status",
            // @ts-ignore
            auth,
            validateSchema(updateBookingStatusSchema),
            catchAsync(BookingController.updateBookingStatus)
        );

        // Get all bookings for a user (as tenant)
        this.router.get(
            "/user",
            // @ts-ignore
            auth,
            catchAsync(BookingController.getUserBookings)
        );

        // Get all bookings for a specific property (as owner)
        this.router.get(
            "/property/:propertyId",
            // @ts-ignore
            auth,
            catchAsync(BookingController.getPropertyBookings)
        );

        // Get a specific booking
        this.router.get(
            "/:id",
            // @ts-ignore
            auth,
            catchAsync(BookingController.getBookingById)
        );

        // Update move-in details
        this.router.patch(
            "/:id/move-in",
            // @ts-ignore
            auth,
            validateSchema(updateMoveInDetailsSchema),
            catchAsync(BookingController.updateMoveInDetails)
        );

        // Update contract details
        this.router.patch(
            "/:id/contract",
            // @ts-ignore
            auth,
            contractUpload, // Add file upload middleware
            (req: Request, res: Response, next: NextFunction) => {
                // Convert string form values to appropriate types
                // @ts-ignore
                if (req.body.signedByOwner) {
                    // @ts-ignore
                    req.body.signedByOwner = req.body.signedByOwner === 'true';
                }

                // @ts-ignore
                if (req.body.signedByTenant) {
                    // @ts-ignore
                    req.body.signedByTenant = req.body.signedByTenant === 'true';
                }

                // Handle JSON data if it's coming through form-data
                // @ts-ignore
                if (req.body.contractData) {
                    try {
                        // @ts-ignore
                        const contractData = JSON.parse(req.body.contractData);
                        // Merge the parsed data with the request body
                        // @ts-ignore
                        req.body = { ...req.body, ...contractData };
                        // @ts-ignore
                        delete req.body.contractData;
                    } catch (error) {
                        // @ts-ignore
                        return res.status(400).json({
                            success: false,
                            message: "Invalid contract data format",
                        });
                    }
                }
                next();
            },
            validateSchema(updateContractDetailsSchema),
            catchAsync(BookingController.updateContractDetails)
        );
    }
}

export default new BookingRoutes().router;