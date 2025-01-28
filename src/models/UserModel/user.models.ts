import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";

const userSchema: Schema<IUser> = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    deviceTokens: [{
        token: {
            type: String,
            required: true
        },
        deviceType: {
            type: String,
            enum: ['ios', 'android', 'web'],
            required: true
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }],
    address: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        region: {
            type: String,
        },
        country: {
            type: String,
        },
        postalCode: {
            type: String,
        },
        coordinates: {
            latitude: {
                type: Number,
            },
            longitude: {
                type: Number,
            },
        },
    }
}, {
    timestamps: true
});

// Create TTL index for OTP expiry
userSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });
// Geospatial index
userSchema.index({ 'address.coordinates': '2dsphere' });

const UserModel = model<IUser>("Users", userSchema);

export default UserModel;