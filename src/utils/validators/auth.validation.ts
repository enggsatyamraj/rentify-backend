import { z } from 'zod';

export const nameSchema = {
    firstName: z.string({
        required_error: "First name is required",
        invalid_type_error: "First name must be a string"
    })
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces")
        .transform(val => val.trim())
        .refine(val => val.length > 0, "First name cannot be empty"),
    lastName: z.string({
        required_error: "Last name is required",
        invalid_type_error: "Last name must be a string"
    })
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces")
        .transform(val => val.trim())
        .refine(val => val.length > 0, "Last name cannot be empty")
};

export const emailSchema = {
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string"
    })
        .email("Invalid email address")
        .max(100, "Email cannot exceed 100 characters")
        .transform(val => val.trim())
        .refine(val => val.length > 0, "Email cannot be empty")
};

const addressSchema = {
    address: z.object({
        street: z.string({
            invalid_type_error: "Street must be a string"
        })
            .min(1, "Street cannot be empty")
            .max(100, "Street cannot exceed 100 characters")
            .transform(val => val.trim())
            .optional(),

        city: z.string({
            invalid_type_error: "City must be a string"
        })
            .min(1, "City cannot be empty")
            .max(50, "City cannot exceed 50 characters")
            .transform(val => val.trim())
            .optional(),

        region: z.string({
            invalid_type_error: "Region must be a string"
        })
            .min(1, "Region cannot be empty")
            .max(50, "Region cannot exceed 50 characters")
            .transform(val => val.trim())
            .optional(),

        country: z.string({
            invalid_type_error: "Country must be a string"
        })
            .min(1, "Country cannot be empty")
            .max(50, "Country cannot exceed 50 characters")
            .transform(val => val.trim())
            .optional(),

        postalCode: z.string({
            invalid_type_error: "Postal code must be a string"
        })
            .min(1, "Postal code cannot be empty")
            .max(20, "Postal code cannot exceed 20 characters")
            .transform(val => val.trim())
            .optional(),

        coordinates: z.object({
            latitude: z.number({
                invalid_type_error: "Latitude must be a number"
            })
                .min(-90, "Latitude must be between -90 and 90")
                .max(90, "Latitude must be between -90 and 90")
                .optional(),

            longitude: z.number({
                invalid_type_error: "Longitude must be a number"
            })
                .min(-180, "Longitude must be between -180 and 180")
                .max(180, "Longitude must be between -180 and 180")
                .optional()
        }).optional()
    }).optional()
};

const aadharSchema = {
    aadharNumber: z.string({
        invalid_type_error: "Aadhar number must be a string"
    })
        .length(12, "Aadhar number must be exactly 12 digits")
        .regex(/^\d+$/, "Aadhar number must contain only numbers")
        .transform(val => val.trim())
        .refine(val => !val.includes(' '), "Aadhar number cannot contain spaces")
        .optional()
};

const dateOfBirthSchema = {
    dateOfBirth: z.string({
        invalid_type_error: "Date of birth must be a string"
    })
        .datetime({
            message: "Invalid date format"
        })
        .refine(value => {
            const date = new Date(value);
            const now = new Date();
            const minDate = new Date();
            minDate.setFullYear(now.getFullYear() - 120); // Max age 120 years
            return date <= now && date >= minDate;
        }, "Date of birth must be between 120 years ago and today")
        .optional()
};

export const passwordSchema = {
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string"
    })
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .refine(val => !val.includes(' '), "Password cannot contain spaces")
};

export const phoneSchema = {
    phoneNumber: z.string({
        invalid_type_error: "Phone number must be a string"
    })
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
        .transform(val => val.trim())
        .refine(val => !val.includes(' '), "Phone number cannot contain spaces")
        .optional()
};

export const otpSchema = {
    otp: z.string({
        required_error: "OTP is required",
        invalid_type_error: "OTP must be a string"
    })
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers")
        .transform(val => val.trim())
        .refine(val => !val.includes(' '), "OTP cannot contain spaces")
};

export const signupSchema = z.object({
    body: z.object({
        ...nameSchema,
        ...emailSchema,
        ...passwordSchema,
        confirmPassword: z.string({
            required_error: "Confirm password is required",
            invalid_type_error: "Confirm password must be a string"
        })
            .refine(val => !val.includes(' '), "Confirm password cannot contain spaces")
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })
});

export const verifySchema = z.object({
    body: z.object({
        ...emailSchema,
        ...otpSchema
    })
});

export const resendOtpSchema = z.object({
    body: z.object({
        ...emailSchema
    })
});

export const signinSchema = z.object({
    body: z.object({
        ...emailSchema,
        password: z.string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string"
        })
            .min(1, "Password is required")
            .refine(val => !val.includes(' '), "Password cannot contain spaces")
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        ...emailSchema
    })
});

// Schema for resetting password with OTP
export const resetPasswordSchema = z.object({
    body: z.object({
        ...emailSchema,
        ...otpSchema,
        newPassword: passwordSchema.password
    })
});

export const updateProfileSchema = z.object({
    firstName: nameSchema.firstName,
    lastName: nameSchema.lastName,
    phoneNumber: phoneSchema.phoneNumber,
    dateOfBirth: dateOfBirthSchema.dateOfBirth,
    aadharNumber: aadharSchema.aadharNumber,
    address: addressSchema.address
}).partial();