import { model, models, Schema } from "mongoose";
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
    aadharNumber: {
        type: String,
        minlength: 12,
        maxlength: 12,
        sparse: true,
    },
    aadharVerified: {
        type: Boolean,
        default: false
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
    propertyListings: [{
        property: {
            type: Schema.Types.ObjectId,
            ref: 'Properties'
        },
        listedAt: {
            type: Date,
            default: Date.now
        }
    }],
    rentedProperties: [{
        property: {
            type: Schema.Types.ObjectId,
            ref: 'Properties'
        },
        rentedFrom: {
            type: Date,
            required: true
        },
        rentedTill: {
            type: Date  // Optional for month-to-month rentals
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
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
// Index for Aadhar number
userSchema.index({ aadharNumber: 1 }, { sparse: true });
// Index for property relationships
userSchema.index({ 'propertyListings.property': 1 });
userSchema.index({ 'rentedProperties.property': 1, 'rentedProperties.isActive': 1 });

const UserModel = models.Users || model<IUser>("Users", userSchema);

export default UserModel;