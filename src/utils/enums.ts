// src/utils/enums.ts

export enum EmailType {
    // Authentication email types
    OTP_VERIFICATION = "OTP_VERIFICATION",
    WELCOME_VERIFIED = "WELCOME_VERIFIED",
    WELCOME_NOT_VERIFIED = "WELCOME_NOT_VERIFIED",
    RESET_PASSWORD_OTP = "RESET_PASSWORD_OTP",
    PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",

    // Booking related email types
    BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION",
    NEW_BOOKING_NOTIFICATION = "NEW_BOOKING_NOTIFICATION",
    BOOKING_CONFIRMED = "BOOKING_CONFIRMED",
    BOOKING_REJECTED = "BOOKING_REJECTED",
    BOOKING_CANCELLED = "BOOKING_CANCELLED",
    BOOKING_COMPLETED = "BOOKING_COMPLETED",
    BOOKING_UPDATED = "BOOKING_UPDATED",
    CONTRACT_READY = "CONTRACT_READY",
    MOVE_IN_REMINDER = "MOVE_IN_REMINDER"
}

// Property types
export enum PropertyType {
    FULL_HOUSE = "full-house",
    SINGLE_ROOM = "single-room",
    MULTI_ROOM = "multi-room",
    PG = "pg"
}

// Room types
export enum RoomType {
    SINGLE = "single",
    DOUBLE = "double",
    TRIPLE = "triple",
    FULL_HOUSE = "full-house"
}

// Furnishing status
export enum FurnishingType {
    FULLY = "fully",
    SEMI = "semi",
    UNFURNISHED = "unfurnished"
}

// Tenant preferences
export enum TenantType {
    FAMILY = "family",
    BACHELORS = "bachelors",
    GIRLS = "girls",
    BOYS = "boys",
    ANY = "any"
}

// Booking status
export enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
    REJECTED = "rejected"
}

// Booking type
export enum BookingType {
    FIXED_TERM = "fixed-term",
    MONTH_TO_MONTH = "month-to-month"
}

// Move-in status
export enum MoveInStatus {
    SCHEDULED = "scheduled",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

// Bill type
export enum BillType {
    DAILY = "daily",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}