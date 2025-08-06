import mongoose from 'mongoose';
import connectAdminDB from '@/lib/admin-db';

const AdminBookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingId: { type: String, unique: true }, // Custom booking ID like BK001, BK002
  confirmationCode: { type: String, unique: true }, // Customer confirmation code
  
  // Villa Information
  villaId: { type: String, required: true },
  villaName: { type: String, required: true },
  villaLocation: { type: String },
  villaImages: [{ type: String }],
  
  // Customer Information
  userId: { type: String, required: true },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String }
    },
    idProof: {
      type: { type: String }, // 'aadhar', 'passport', 'driving_license'
      number: { type: String },
      verified: { type: Boolean, default: false }
    }
  },
  
  // Guest Information
  guestDetails: [{
    name: { type: String },
    age: { type: Number },
    relation: { type: String }, // 'self', 'spouse', 'child', 'friend', etc.
    idProof: {
      type: { type: String },
      number: { type: String }
    }
  }],
  totalGuests: { type: Number, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  infants: { type: Number, default: 0 },
  
  // Booking Dates
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  numberOfNights: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  
  // Pricing Breakdown
  pricing: {
    basePrice: { type: Number, required: true }, // Per night rate
    totalBaseAmount: { type: Number, required: true }, // Base price × nights
    weekendSurcharge: { type: Number, default: 0 },
    seasonalSurcharge: { type: Number, default: 0 },
    extraGuestCharges: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    taxes: {
      gst: { type: Number, default: 0 },
      serviceTax: { type: Number, default: 0 },
      localTax: { type: Number, default: 0 }
    },
    discounts: {
      couponCode: { type: String },
      couponDiscount: { type: Number, default: 0 },
      earlyBirdDiscount: { type: Number, default: 0 },
      loyaltyDiscount: { type: Number, default: 0 }
    },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 }
  },
  
  // Payment Information
  paymentDetails: {
    paymentMethod: { type: String }, // 'razorpay', 'stripe', 'bank_transfer', 'cash'
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    paymentDate: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    stripePaymentIntentId: { type: String },
    transactionId: { type: String },
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      utrNumber: { type: String }
    }
  },
  
  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  
  // Check-in/Check-out Details
  checkInDetails: {
    actualCheckInTime: { type: Date },
    checkInNotes: { type: String },
    keyHandoverTime: { type: Date },
    securityDepositCollected: { type: Number },
    damageDeposit: { type: Number },
    checkInPhotos: [{ type: String }]
  },
  checkOutDetails: {
    actualCheckOutTime: { type: Date },
    checkOutNotes: { type: String },
    damageAssessment: { type: String },
    securityDepositReturned: { type: Number },
    cleaningStatus: { type: String },
    checkOutPhotos: [{ type: String }]
  },
  
  // Special Requests & Services
  specialRequests: { type: String },
  addOnServices: [{
    serviceName: { type: String },
    servicePrice: { type: Number },
    serviceDate: { type: Date },
    serviceStatus: { type: String }
  }],
  
  // Communication History
  communicationLog: [{
    date: { type: Date, default: Date.now },
    type: { type: String }, // 'email', 'sms', 'call', 'whatsapp'
    subject: { type: String },
    message: { type: String },
    sentBy: { type: String }, // Admin ID or 'system'
    sentTo: { type: String }, // 'customer' or specific admin
    status: { type: String } // 'sent', 'delivered', 'read', 'failed'
  }],
  
  // Reviews & Feedback
  customerReview: {
    rating: { type: Number, min: 1, max: 5 },
    reviewText: { type: String },
    reviewDate: { type: Date },
    recommended: { type: Boolean },
    photosShared: [{ type: String }]
  },
  
  // Admin Management
  adminNotes: { type: String },
  internalNotes: { type: String },
  assignedTo: { type: String }, // Admin ID handling this booking
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [{ type: String }],
  
  // Cancellation Details
  cancellationDetails: {
    cancelledBy: { type: String }, // 'customer' or 'admin'
    cancellationReason: { type: String },
    cancellationDate: { type: Date },
    refundAmount: { type: Number },
    refundDate: { type: Date },
    refundMethod: { type: String },
    refundTransactionId: { type: String },
    cancellationFee: { type: Number }
  },
  
  // Legal & Compliance
  agreementSigned: { type: Boolean, default: false },
  agreementDate: { type: Date },
  termsAccepted: { type: Boolean, default: false },
  privacyPolicyAccepted: { type: Boolean, default: false },
  
  // Technical Details
  bookingSource: { type: String }, // 'website', 'mobile_app', 'phone', 'walk_in'
  deviceInfo: {
    userAgent: { type: String },
    ipAddress: { type: String },
    platform: { type: String }, // 'web', 'ios', 'android'
  },
  referralSource: { type: String },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  
  // Last Modified
  lastModifiedBy: { type: String },
  
}, {
  timestamps: true,
  collection: 'bookings' // Explicit collection name
});

// Pre-save middleware to generate booking ID
AdminBookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    const BookingModel = this.constructor as mongoose.Model<any>;
    const count = await BookingModel.countDocuments();
    this.bookingId = `BK${String(count + 1).padStart(6, '0')}`;
    this.confirmationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

// Create model with admin database connection
let AdminBooking: mongoose.Model<any>;

const getAdminBookingModel = async () => {
  if (AdminBooking) {
    return AdminBooking;
  }
  
  const adminConnection = await connectAdminDB();
  
  // Check if model already exists on this connection
  if (adminConnection.models.AdminBooking) {
    AdminBooking = adminConnection.models.AdminBooking;
  } else {
    AdminBooking = adminConnection.model('AdminBooking', AdminBookingSchema);
  }
  
  return AdminBooking;
};

export default getAdminBookingModel;
