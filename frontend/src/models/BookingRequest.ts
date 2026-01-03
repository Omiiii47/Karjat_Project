import { Schema, model, models, type Document } from 'mongoose';

export interface IBookingRequest extends Document {
  villaId: string;
  villaName: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfKids: number;
  numberOfPets: number;
  purposeOfVisit: string;
  otherPurpose?: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  specialRequests?: string;
  status: 'pending' | 'accepted' | 'declined' | 'custom-offer';
  bookingType?: string;
  bookingSource?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  bookingId?: string;
  customOffer?: {
    isCustomOffer: boolean;
    adjustedPricePerNight: number;
    adjustedTotalAmount: number;
    discountAmount: number;
    discountPercentage: number;
    salesNotes?: string;
    offerExpiresAt?: Date;
    offeredBy?: string;
    offeredAt?: Date;
  };
  salesResponse?: {
    action: 'accept' | 'decline';
    respondedAt: Date;
    respondedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    villaId: {
      type: String,
      required: [true, 'Villa ID is required']
    },
    villaName: {
      type: String,
      required: [true, 'Villa name is required'],
      trim: true
    },
    userId: {
      type: String,
      required: false
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone is required'],
      trim: true
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required']
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required']
    },
    numberOfAdults: {
      type: Number,
      required: [true, 'Number of adults is required'],
      default: 1
    },
    numberOfKids: {
      type: Number,
      required: [true, 'Number of kids is required'],
      default: 0
    },
    numberOfPets: {
      type: Number,
      required: [true, 'Number of pets is required'],
      default: 0
    },
    purposeOfVisit: {
      type: String,
      required: [true, 'Purpose of visit is required']
    },
    otherPurpose: {
      type: String,
      required: false
    },
    numberOfNights: {
      type: Number,
      required: [true, 'Number of nights is required']
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    },
    specialRequests: {
      type: String,
      required: false,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'custom-offer'],
      default: 'pending'
    },
    bookingType: {
      type: String,
      required: false
    },
    bookingSource: {
      type: String,
      required: false
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    bookingId: {
      type: String,
      required: false
    },
    customOffer: {
      isCustomOffer: {
        type: Boolean,
        default: false
      },
      adjustedPricePerNight: Number,
      adjustedTotalAmount: Number,
      discountAmount: Number,
      discountPercentage: Number,
      salesNotes: String,
      offerExpiresAt: Date,
      offeredBy: String,
      offeredAt: Date
    },
    salesResponse: {
      action: {
        type: String,
        enum: ['accept', 'decline']
      },
      respondedAt: Date,
      respondedBy: String
    }
  },
  {
    timestamps: true
  }
);

export default models.BookingRequest || model<IBookingRequest>('BookingRequest', BookingRequestSchema);
