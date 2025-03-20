// booking.interface.ts
import { Document, Types } from "mongoose";

export interface IBooking extends Document {
    property: Types.ObjectId;
    tenant: Types.ObjectId;
    owner: Types.ObjectId;
    startDate: Date;
    endDate?: Date;
    bookingType: 'fixed-term' | 'month-to-month';
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
    moveInDetails?: {
        scheduledDate?: Date;
        status: 'scheduled' | 'completed' | 'cancelled';
        notes?: string;
    };
    cancellationDetails?: {
        cancelledBy?: Types.ObjectId;
        cancelledAt?: Date;
        reason?: string;
    };
    reviewId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}