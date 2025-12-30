const mongoose = require('mongoose');

const VillaSchema = new mongoose.Schema({
  // Basic Villa Information
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  
  // Location Details
  location: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  // Pricing
  price: { type: Number, required: true }, // Per night base price
  weekendPrice: { type: Number }, // Weekend pricing
  seasonalPricing: [{
    season: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    price: { type: Number }
  }],
  extraGuestCharge: { type: Number, default: 0 },
  cleaningFee: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  
  // Villa Specifications
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  totalArea: { type: Number },
  builtYear: { type: Number },
  
  // Room Details
  rooms: [{
    type: { type: String },
    name: { type: String },
    description: { type: String },
    amenities: [{ type: String }]
  }],
  
  // Media
  images: [{ type: mongoose.Schema.Types.Mixed }], // Accept both strings and objects
  swipeDeckImage: { type: String }, // Main display image
  videos: [{
    url: { type: String },
    title: { type: String },
    duration: { type: Number }
  }],
  virtualTourUrl: { type: String },
  
  // Features & Amenities
  features: [{ type: String }],
  amenities: [{ type: String }],
  nearbyAttractions: [{
    name: { type: String },
    distance: { type: String },
    type: { type: String }
  }],
  
  // Rules & Policies
  houseRules: [{ type: String }],
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '12:00' },
  cancellationPolicy: { type: String },
  petPolicy: { type: String },
  smokingPolicy: { type: String },
  partyPolicy: { type: String },
  
  // Availability
  availability: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  blockedDates: [{
    startDate: { type: Date },
    endDate: { type: Date },
    reason: { type: String }
  }],
  minStayDuration: { type: Number, default: 1 }, // in nights
  maxStayDuration: { type: Number },
  
  // Status & Publishing
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  
  // Metadata
  viewCount: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // SEO
  slug: { type: String, unique: true, sparse: true },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }],
  
  // Admin Info
  lastModifiedBy: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

// Create slug from name if not provided
VillaSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Villa', VillaSchema);
