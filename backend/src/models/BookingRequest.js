const mongoose = require('mongoose');

const BookingRequestSchema = new mongoose.Schema({
  userId: {
    type: String
  },
  villaId: {
    type: String,
    required: true
  },
  villaName: {
    type: String,
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String,
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true
  },
  numberOfAdults: {
    type: Number,
    required: true
  },
  numberOfKids: {
    type: Number,
    default: 0
  },
  numberOfPets: {
    type: Number,
    default: 0
  },
  purposeOfVisit: {
    type: String,
    required: true
  },
  otherPurpose: {
    type: String
  },
  numberOfNights: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  specialRequests: {
    type: String
  },
  bookingType: {
    type: String
  },
  bookingSource: {
    type: String
  },
  createdBy: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'custom-offer'],
    default: 'pending'
  },
  customOffer: {
    isCustomOffer: { type: Boolean, default: false },
    adjustedPricePerNight: { type: Number },
    adjustedTotalAmount: { type: Number },
    discountAmount: { type: Number },
    discountPercentage: { type: Number },
    salesNotes: { type: String },
    offerExpiresAt: { type: Date },
    offeredBy: { type: String },
    offeredAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingRequest', BookingRequestSchema);
