// booking.model.ts
import { model, models, Schema } from "mongoose";
import { IBooking } from "./booking.interface";

const bookingSchema: Schema<IBooking> = new Schema({
    property: {
        type: Schema.Types.ObjectId,
        ref: 'Properties',
        required: true
    },
    tenant: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    bookingType: {
        type: String,
        enum: ['fixed-term', 'month-to-month'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending'
    },
    moveInDetails: {
        scheduledDate: Date,
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled'],
            default: 'scheduled'
        },
        notes: String
    },
    cancellationDetails: {
        cancelledBy: {
            type: Schema.Types.ObjectId,
            ref: 'Users'
        },
        cancelledAt: Date,
        reason: String
    },
    roomCount: {
        type: Number,
        default: 1,
        min: 1
    },
    contractDetails: {
        documentUrl: String,
        signedByTenant: {
            type: Boolean,
            default: false
        },
        signedByOwner: {
            type: Boolean,
            default: false
        },
        signedAt: Date
    },
    reviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Reviews'
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ property: 1, status: 1 });
bookingSchema.index({ tenant: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ startDate: 1 });

const BookingModel = models.Bookings || model<IBooking>('Bookings', bookingSchema);

export default BookingModel;