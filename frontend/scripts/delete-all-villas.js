require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const path = require('path');

// Define Villa schema inline
const VillaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
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
  price: { type: Number, required: true },
  weekendPrice: { type: Number },
  seasonalPricing: [{
    season: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    price: { type: Number }
  }],
  extraGuestCharge: { type: Number, default: 0 },
  capacity: {
    maxGuests: { type: Number, required: true },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    beds: { type: Number }
  },
  amenities: [{
    name: { type: String },
    icon: { type: String },
    category: { type: String }
  }],
  images: [{
    url: { type: String },
    caption: { type: String },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number }
  }],
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Villa = mongoose.models.Villa || mongoose.model('Villa', VillaSchema);

const deleteAllVillas = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count existing villas
    const count = await Villa.countDocuments();
    console.log(`Found ${count} villa(s) in database`);

    if (count === 0) {
      console.log('No villas to delete');
      process.exit(0);
    }

    // Delete all villas
    const result = await Villa.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} villa(s)`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

deleteAllVillas();
