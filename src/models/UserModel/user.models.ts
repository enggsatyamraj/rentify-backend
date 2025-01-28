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
        // required: true,
        expires: 600 // 10 minutes
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
    }]
    ,
    address: {
        street: {
            type: String,
            // required: true,
        },
        city: {
            type: String,
            // required: true,
        },
        region: {
            type: String,
            // required: true,
        },
        country: {
            type: String,
            // required: true,
        },
        postalCode: {
            type: String,
            // required: true,
        },
        coordinates: {
            latitude: {
                type: Number,
                // required: true,
            },
            longitude: {
                type: Number,
                // required: true,
            },
        },
    }
},
    {
        timestamps: true
    })

userSchema.index({ 'address.coordinates': '2dsphere' })

const UserModel = model<IUser>("Users", userSchema);

export default UserModel;