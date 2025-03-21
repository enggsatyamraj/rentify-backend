// src/utils/validators/booking.validation.ts
import { z } from "zod";

// Create booking schema
export const createBookingSchema = z.object({
    body: z.object({
        propertyId: z.string({
            required_error: "Property ID is required",
        }).min(1, "Property ID cannot be empty"),

        startDate: z.string({
            required_error: "Start date is required",
        }).refine(
            (date) => !isNaN(Date.parse(date)),
            "Invalid date format. Use YYYY-MM-DD"
        ),

        endDate: z.string().refine(
            (date) => date === "" || !isNaN(Date.parse(date)),
            "Invalid date format. Use YYYY-MM-DD"
        ).optional(),

        bookingType: z.enum(["fixed-term", "month-to-month"], {
            required_error: "Booking type is required",
            invalid_type_error: "Booking type must be either 'fixed-term' or 'month-to-month'",
        }),
        roomCount: z.number()
            .int("Room count must be an integer")
            .positive("Room count must be positive")
            .default(1)
            .optional(), // Default to booking 1 room
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

// Update booking status schema
export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(["confirmed", "cancelled", "completed", "rejected"], {
            required_error: "Status is required",
            invalid_type_error: "Status must be one of: confirmed, cancelled, completed, rejected",
        }),

        reason: z.string().optional(),

        scheduledDate: z.string().refine(
            (date) => date === "" || !isNaN(Date.parse(date)),
            "Invalid date format. Use YYYY-MM-DD"
        ).optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({
        id: z.string({
            required_error: "Booking ID is required",
        }).min(1, "Booking ID cannot be empty"),
    }),
});

// Update move-in details schema
export const updateMoveInDetailsSchema = z.object({
    body: z.object({
        scheduledDate: z.string().refine(
            (date) => date === "" || !isNaN(Date.parse(date)),
            "Invalid date format. Use YYYY-MM-DD"
        ).optional(),

        status: z.enum(["scheduled", "completed", "cancelled"], {
            invalid_type_error: "Status must be one of: scheduled, completed, cancelled",
        }).optional(),

        notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    }).refine(
        (data) => data.scheduledDate || data.status || data.notes,
        "At least one field must be provided"
    ),
    query: z.object({}).optional(),
    params: z.object({
        id: z.string({
            required_error: "Booking ID is required",
        }).min(1, "Booking ID cannot be empty"),
    }),
});

// Update contract details schema
export const updateContractDetailsSchema = z.object({
    body: z.object({
        documentUrl: z.string().url("Invalid document URL").optional(),

        // If the request is to sign the contract, these can be true
        signedByTenant: z.boolean().optional(),
        signedByOwner: z.boolean().optional(),
    }).refine(
        (data) => data.documentUrl || data.signedByTenant || data.signedByOwner,
        "At least one field must be provided"
    ),
    query: z.object({}).optional(),
    params: z.object({
        id: z.string({
            required_error: "Booking ID is required",
        }).min(1, "Booking ID cannot be empty"),
    }),
});

// Get user bookings query schema
export const getUserBookingsSchema = z.object({
    query: z.object({
        status: z.enum(["pending", "confirmed", "cancelled", "completed", "rejected"]).optional(),
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
});

// Get property bookings schema
export const getPropertyBookingsSchema = z.object({
    query: z.object({
        status: z.enum(["pending", "confirmed", "cancelled", "completed", "rejected"]).optional(),
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({
        propertyId: z.string({
            required_error: "Property ID is required",
        }).min(1, "Property ID cannot be empty"),
    }),
});

// Get booking by ID schema
export const getBookingByIdSchema = z.object({
    query: z.object({}).optional(),
    body: z.object({}).optional(),
    params: z.object({
        id: z.string({
            required_error: "Booking ID is required",
        }).min(1, "Booking ID cannot be empty"),
    }),
});