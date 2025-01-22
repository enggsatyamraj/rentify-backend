import { Document, Schema } from "mongoose";

export interface IAddress extends Document {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    coordinates: {
        latitude: number;
        longitude: number;
    }
}

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
    dateOfBirth?: Date;
    address?: IAddress;
}

