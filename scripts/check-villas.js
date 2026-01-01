require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define Villa schema inline
const VillaSchema = new mongoose.Schema({}, { strict: false });

const checkVillas = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Villa = mongoose.models.Villa || mongoose.model('Villa', VillaSchema);

    const count = await Villa.countDocuments();
    console.log(`\nTotal villas in database: ${count}`);

    if (count > 0) {
      const villas = await Villa.find({}).limit(10);
      console.log('\nVillas:');
      villas.forEach((villa, index) => {
        console.log(`\n${index + 1}. ${villa.name}`);
        console.log(`   Location: ${villa.location}`);
        console.log(`   Price: ₹${villa.price}`);
        console.log(`   Active: ${villa.isActive}`);
        console.log(`   Published: ${villa.isPublished}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkVillas();
