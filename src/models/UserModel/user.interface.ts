import { Document, Types } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email: string;
    password: string;
    profileImage?: string;
    aadharNumber?: string;
    aadharVerified: boolean;
    dateOfBirth?: Date;
    isDeleted: boolean;
    isVerified: boolean;
    otp?: string;
    isAdmin: boolean;
    otpExpiry?: Date;
    propertyListings?: [{
        property: Types.ObjectId;
        listedAt: Date;
    }];
    rentedProperties?: [{
        property: Types.ObjectId;
        rentedFrom: Date;
        rentedTill?: Date;
        isActive: boolean;
    }];
    deviceTokens?: [{
        token: string;
        deviceType: string;
        lastUsed: Date;
    }];
    address?: {
        street?: string;
        city?: string;
        region?: string;
        country?: string;
        postalCode?: string;
        coordinates?: {
            latitude?: number;
            longitude?: number;
        };
    };
}