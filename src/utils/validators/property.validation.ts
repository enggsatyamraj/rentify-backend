import { z } from 'zod';

const priceSchema = {
    basePrice: z.number({
        required_error: "Base price is required",
        invalid_type_error: "Base price must be a number"
    })
        .min(1, "Base price must be greater than 0"),
    billType: z.enum(['daily', 'monthly'], {
        required_error: "Bill type is required",
        invalid_type_error: "Invalid bill type"
    }),
    securityDeposit: z.number({
        required_error: "Security deposit is required",
        invalid_type_error: "Security deposit must be a number"
    })
        .min(0, "Security deposit cannot be negative")
};

const locationSchema = {
    address: z.string({
        required_error: "Address is required",
        invalid_type_error: "Address must be a string"
    })
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address cannot exceed 200 characters"),
    city: z.string({
        required_error: "City is required",
        invalid_type_error: "City must be a string"
    })
        .min(2, "City must be at least 2 characters")
        .max(50, "City cannot exceed 50 characters"),
    state: z.string({
        required_error: "State is required",
        invalid_type_error: "State must be a string"
    })
        .min(2, "State must be at least 2 characters")
        .max(50, "State cannot exceed 50 characters"),
    pincode: z.string({
        required_error: "Pincode is required",
        invalid_type_error: "Pincode must be a string"
    })
        .regex(/^\d{6}$/, "Invalid pincode format"),
    landmark: z.string().optional(),
    coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional()
    }).optional()
};

const detailsSchema = {
    roomType: z.enum(['single', 'double', 'triple', 'full-house'], {
        required_error: "Room type is required",
        invalid_type_error: "Invalid room type"
    }),
    totalRooms: z.number({
        required_error: "Total rooms is required",
        invalid_type_error: "Total rooms must be a number"
    })
        .min(1, "Total rooms must be at least 1"),
    availableRooms: z.number({
        required_error: "Available rooms is required",
        invalid_type_error: "Available rooms must be a number"
    })
        .min(1, "Available rooms must be at least 1"),
    sharedBathroom: z.boolean().default(false),
    furnishingStatus: z.enum(['fully', 'semi', 'unfurnished'], {
        required_error: "Furnishing status is required",
        invalid_type_error: "Invalid furnishing status"
    }),
    roomSize: z.number({
        required_error: "Room size is required",
        invalid_type_error: "Room size must be a number"
    })
        .min(1, "Room size must be greater than 0"),
    floorNumber: z.number({
        required_error: "Floor number is required",
        invalid_type_error: "Floor number must be a number"
    })
        .min(0, "Floor number cannot be negative"),
    parking: z.boolean().default(false)
};

const maintainenceSchema = {
    amount: z.number().default(0),
    billType: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
    includesFood: z.boolean().default(false),
    includesUtility: z.boolean().default(false)
};

export const createPropertySchema = z.object({
    body: z.object({
        title: z.string({
            required_error: "Title is required",
            invalid_type_error: "Title must be a string"
        })
            .min(10, "Title must be at least 10 characters")
            .max(100, "Title cannot exceed 100 characters"),
        description: z.string({
            required_error: "Description is required",
            invalid_type_error: "Description must be a string"
        })
            .min(20, "Description must be at least 20 characters")
            .max(1000, "Description cannot exceed 1000 characters"),
        propertyType: z.enum(['full-house', 'single-room', 'multi-room', 'pg'], {
            required_error: "Property type is required",
            invalid_type_error: "Invalid property type"
        }),
        price: z.object(priceSchema),
        location: z.object(locationSchema),
        details: z.object(detailsSchema),
        amenities: z.array(z.string()).min(1, "At least one amenity is required"),
        preferredTenants: z.array(
            z.enum(['family', 'bachelors', 'girls', 'boys', 'any'])
        ).min(1, "At least one preferred tenant type is required"),
        rules: z.array(z.string()).optional(),
        foodAvailable: z.boolean().default(false),
        maintainenceCharges: z.object(maintainenceSchema).optional()
    })
});

export const updatePropertySchema = z.object({
    body: createPropertySchema.shape.body.partial(),
    params: z.object({
        id: z.string({
            required_error: "Property ID is required",
            invalid_type_error: "Property ID must be a string"
        }).regex(/^[0-9a-fA-F]{24}$/, "Invalid property ID")
    })
});

export const propertyIdSchema = z.object({
    params: z.object({
        id: z.string({
            required_error: "Property ID is required",
            invalid_type_error: "Property ID must be a string"
        }).regex(/^[0-9a-fA-F]{24}$/, "Invalid property ID")
    })
});

export const getPropertiesSchema = z.object({
    query: z.object({
        city: z.string().optional(),
        propertyType: z.enum(['full-house', 'single-room', 'multi-room', 'pg']).optional(),
        minPrice: z.string().regex(/^\d+$/, "Min price must be a number").optional(),
        maxPrice: z.string().regex(/^\d+$/, "Max price must be a number").optional(),
        roomType: z.enum(['single', 'double', 'triple', 'full-house']).optional(),
        furnishingStatus: z.enum(['fully', 'semi', 'unfurnished']).optional(),
        preferredTenants: z.enum(['family', 'bachelors', 'girls', 'boys', 'any']).optional(),
        page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
        limit: z.string().regex(/^\d+$/, "Limit must be a number").optional()
    })
});