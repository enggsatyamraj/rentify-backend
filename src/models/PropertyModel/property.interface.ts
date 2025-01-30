import { Types } from "mongoose";

export interface IProperty {
    title: string;
    description: string;
    propertyType: string;  // full-house, single-room, shared-room, pg
    owner: Types.ObjectId;
    price: {
        basePrice: number;
        billType: string; // monthly, yearly, daily
        securityDeposit: number;
    };
    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    details: {
        roomType: string;
        totalRooms: number;
        availableRooms: number;
        sharedBathroom: boolean;
        furnishingStatus: string;
        roomSize: number;
        floorNumber: number;
        parking: boolean;
    };
    amenities: string[];
    preferredTenants: string[];
    availableFrom: Date;
    images: [{
        key: string;
        url: string;
        isPrimary: boolean;
    }];
    status: {
        isActive: boolean;
        isVerified: boolean;
        isRented: boolean;
        isFeatured: boolean;
    };
    rules: string[];
    foodAvailable: boolean;
    maintainenceCharges: {
        amount: number;
        billType: string;
        includesFoode: boolean;
        includeUtility: boolean;
    };
    metaData: {
        views: number;
        favoriteCount: number;
    }
}