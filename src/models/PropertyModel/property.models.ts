import { model, models, Schema } from "mongoose";
import { IProperty } from "./property.interface";

const propertySchema = new Schema<IProperty>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['full-house', 'single-room', 'multi-room', 'pg']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    price: {
        basePrice: {
            type: Number,
            required: true
        },
        billType: {
            type: String,
            enum: ['daily', 'monthly'],
            default: 'monthly'
        },
        securityDeposit: {
            type: Number,
            required: true
        }
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        landmark: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    details: {
        roomType: {
            type: String,
            enum: ['single', 'double', 'triple', 'full-house'],
            required: true
        },
        totalRooms: {
            type: Number,
            required: true
        },
        availableRooms: {
            type: Number,
            required: true
        },
        sharedBathroom: {
            type: Boolean,
            default: false
        },
        furnishingStatus: {
            type: String,
            enum: ['fully', 'semi', 'unfurnished'],
            required: true
        },
        roomSize: {
            type: Number,
            required: true
        },
        floorNumber: {
            type: Number,
            required: true
        },
        parking: {
            type: Boolean,
            default: false
        }
    },
    amenities: [{
        type: String,
    }],
    preferredTenants: [{
        type: String,
        enum: ['family', 'bachelors', 'girls', 'boys', 'any']
    }],
    availableFrom: {
        type: Date,
        required: true
    },
    images: [{
        key: String,
        url: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    status: {
        isActive: {
            type: Boolean,
            default: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isRented: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    rules: [String],
    foodAvailable: {
        type: Boolean,
        default: false
    },
    maintainenceCharges: {
        amount: {
            type: Number,
            default: 0
        },
        billType: {
            type: String,
            enum: ['monthly', 'quarterly', 'yearly'],
            default: 'monthly'
        },
        includesFood: {
            type: Boolean,
            default: false
        },
        includesUtility: {
            type: Boolean,
            default: false
        }
    },
    metaData: {
        views: {
            type: Number,
            default: 0
        },
        favoriteCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for common queries
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ 'price.basePrice': 1 });
propertySchema.index({ 'details.roomType': 1 });
propertySchema.index({ 'details.availableRooms': 1 });
propertySchema.index({ 'status.isActive': 1, 'status.isVerified': 1 });

const PropertyModel = models.Properties || model<IProperty>('Properties', propertySchema);

export default PropertyModel;