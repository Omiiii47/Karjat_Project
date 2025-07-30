import { Schema, model, models, type Document } from 'mongoose';

export interface IBooking extends Document {
  villaId: string;
  villaName: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  bookingReference: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
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
    required: false // Allow bookings without user login for now
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Guest name cannot exceed 100 characters']
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
    required: [true, 'Number of guests is required'],
    min: [1, 'Must have at least 1 guest'],
    max: [20, 'Cannot exceed 20 guests']
  },
  numberOfNights: {
    type: Number,
    required: [true, 'Number of nights is required'],
    min: [1, 'Must book at least 1 night']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  bookingReference: {
    type: String
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
BookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'VB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Also ensure bookingReference is set on creation
BookingSchema.pre('validate', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'VB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Indexes for better performance
BookingSchema.index({ villaId: 1 });
BookingSchema.index({ guestEmail: 1 });
BookingSchema.index({ bookingReference: 1 }, { unique: true });
BookingSchema.index({ checkInDate: 1 });
BookingSchema.index({ createdAt: -1 });

export const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);
