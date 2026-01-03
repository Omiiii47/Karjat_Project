import { Schema, model, models, type Document } from 'mongoose';
import { BookingReferenceCounter } from './BookingReferenceCounter';

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

function getVillaPrefix(villaName: string): string {
  const cleaned = (villaName || '').trim();
  if (!cleaned) return 'BK';

  const firstToken = cleaned.split(/\s+/)[0] || cleaned;
  const lettersOnly = firstToken.replace(/[^a-zA-Z]/g, '');
  const prefix = (lettersOnly || firstToken).slice(0, 2).toUpperCase();
  return prefix.length === 2 ? prefix : (prefix + 'X').slice(0, 2);
}

function formatYYYYMMDD(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

async function generateBookingReference(params: {
  villaId: string;
  villaName: string;
}): Promise<string> {
  const now = new Date();
  const date = formatYYYYMMDD(now);
  const prefix = getVillaPrefix(params.villaName);

  const counter = await BookingReferenceCounter.findOneAndUpdate(
    { villaId: params.villaId, date },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seq = String(counter.seq).padStart(2, '0');
  return `${prefix}${date}${seq}`;
}

// Ensure bookingReference is set (format: XXYYYYMMDDNN)
BookingSchema.pre('validate', async function () {
  if (this.bookingReference) return;
  if (!this.villaId || !this.villaName) return;
  this.bookingReference = await generateBookingReference({
    villaId: this.villaId,
    villaName: this.villaName
  });
});

// Indexes for better performance
BookingSchema.index({ villaId: 1 });
BookingSchema.index({ guestEmail: 1 });
BookingSchema.index({ bookingReference: 1 }, { unique: true });
BookingSchema.index({ checkInDate: 1 });
BookingSchema.index({ createdAt: -1 });

export const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);
