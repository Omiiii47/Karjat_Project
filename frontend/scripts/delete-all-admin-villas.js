require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define AdminVilla schema inline
const AdminVillaSchema = new mongoose.Schema({
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
  maxGuests: { type: Number, required: true },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  beds: { type: Number },
  amenities: [{
    name: { type: String },
    icon: { type: String },
    category: { type: String }
  }],
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const deleteAllAdminVillas = async () => {
  try {
    // Check if ADMIN_MONGODB_URI exists
    if (!process.env.ADMIN_MONGODB_URI) {
      console.error('❌ ADMIN_MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    // Connect to Admin MongoDB
    console.log('Connecting to Admin MongoDB...');
    const connection = await mongoose.createConnection(process.env.ADMIN_MONGODB_URI).asPromise();
    console.log('✅ Connected to Admin MongoDB');

    // Get the AdminVilla model
    const AdminVilla = connection.model('AdminVilla', AdminVillaSchema);

    // Count existing villas
    const count = await AdminVilla.countDocuments();
    console.log(`Found ${count} villa(s) in Admin database`);

    if (count === 0) {
      console.log('No villas to delete');
      await connection.close();
      process.exit(0);
    }

    // List all villas before deletion
    const villas = await AdminVilla.find({}, 'name location');
    console.log('\nVillas to be deleted:');
    villas.forEach((villa, index) => {
      console.log(`  ${index + 1}. ${villa.name} (${villa.location})`);
    });

    // Delete all villas
    const result = await AdminVilla.deleteMany({});
    console.log(`\n✅ Successfully deleted ${result.deletedCount} villa(s) from Admin database`);

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

deleteAllAdminVillas();
