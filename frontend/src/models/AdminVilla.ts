import mongoose from 'mongoose';
import connectAdminDB from '@/lib/admin-db';

const AdminVillaSchema = new mongoose.Schema({
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
    season: { type: String }, // e.g., 'peak', 'off-season', 'festival'
    startDate: { type: Date },
    endDate: { type: Date },
    price: { type: Number }
  }],
  extraGuestCharge: { type: Number, default: 0 }, // Per extra guest
  cleaningFee: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  
  // Villa Specifications
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  totalArea: { type: Number }, // in sq ft
  builtYear: { type: Number },
  
  // Room Details
  rooms: [{
    type: { type: String }, // 'bedroom', 'bathroom', 'living', 'kitchen', etc.
    name: { type: String },
    description: { type: String },
    amenities: [{ type: String }]
  }],
  
  // Media
  images: [{ 
    url: { type: String, required: true },
    caption: { type: String },
    isMain: { type: Boolean, default: false },
    category: { type: String } // 'exterior', 'interior', 'bedroom', 'bathroom', etc.
  }],
  videos: [{
    url: { type: String },
    title: { type: String },
    duration: { type: Number } // in seconds
  }],
  virtualTourUrl: { type: String },
  
  // Features & Amenities
  features: [{ type: String }], // Pool, Garden, WiFi, etc.
  amenities: [{ type: String }], // AC, TV, Kitchen, etc.
  nearbyAttractions: [{
    name: { type: String },
    distance: { type: String },
    type: { type: String } // 'restaurant', 'beach', 'temple', etc.
  }],
  
  // Rules & Policies
  houseRules: [{ type: String }],
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '12:00' },
  cancellationPolicy: { type: String },
  petPolicy: { type: String },
  smokingPolicy: { type: String },
  partyPolicy: { type: String },
  
  // Availability & Booking
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  availabilityCalendar: [{
    date: { type: Date },
    isAvailable: { type: Boolean },
    price: { type: Number }, // Override price for specific date
    reason: { type: String } // Why not available
  }],
  minimumStay: { type: Number, default: 1 }, // Minimum nights
  maximumStay: { type: Number }, // Maximum nights
  advanceBookingDays: { type: Number, default: 365 },
  
  // Owner/Management Details
  ownerId: { type: String },
  ownerName: { type: String },
  ownerContact: {
    phone: { type: String },
    email: { type: String },
    alternatePhone: { type: String }
  },
  managementCompany: { type: String },
  
  // Admin Management
  adminNotes: { type: String },
  internalNotes: { type: String },
  lastModifiedBy: { type: String },
  approvedBy: { type: String },
  approvedDate: { type: Date },
  rejectionReason: { type: String },
  
  // SEO & Marketing
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [{ type: String }],
  tags: [{ type: String }],
  category: { type: String }, // 'luxury', 'budget', 'family', 'romantic', etc.
  
  // Statistics
  views: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // Legal & Compliance
  licenseNumber: { type: String },
  taxId: { type: String },
  insuranceDetails: { type: String },
  safetyFeatures: [{ type: String }],
  
}, {
  timestamps: true,
  collection: 'villas' // Explicit collection name
});

// Create model with admin database connection
let AdminVilla: mongoose.Model<any>;

const getAdminVillaModel = async () => {
  if (AdminVilla) {
    return AdminVilla;
  }
  
  const adminConnection = await connectAdminDB();
  
  // Check if model already exists on this connection
  if (adminConnection.models.AdminVilla) {
    AdminVilla = adminConnection.models.AdminVilla;
  } else {
    AdminVilla = adminConnection.model('AdminVilla', AdminVillaSchema);
  }
  
  return AdminVilla;
};

export default getAdminVillaModel;
