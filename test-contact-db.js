const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://omvilas15:omvilas15@cluster0.codxpap.mongodb.net/villa-booking?retryWrites=true&w=majority&appName=Cluster0';

async function testContactDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Define Contact schema
    const ContactSchema = new mongoose.Schema({
      name: String,
      email: String,
      subject: String,
      message: String,
      status: { type: String, default: 'new' }
    }, { timestamps: true });

    const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

    // Check existing contacts
    console.log('📋 Checking existing contacts...');
    const existingContacts = await Contact.find().sort({ createdAt: -1 });
    console.log(`📊 Found ${existingContacts.length} existing contacts:`);
    
    existingContacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.name} (${contact.email}) - ${contact.subject}`);
    });

    // Create a test contact
    console.log('💾 Creating test contact...');
    const testContact = new Contact({
      name: 'Test User from Script',
      email: 'testscript@example.com',
      subject: 'Test Subject from Script',
      message: 'This is a test message created directly from the test script to verify MongoDB connection and data saving.'
    });

    const savedContact = await testContact.save();
    console.log('✅ Test contact created successfully:', savedContact._id);

    // Check all contacts again
    const allContacts = await Contact.find().sort({ createdAt: -1 });
    console.log(`📊 Total contacts after test: ${allContacts.length}`);

    console.log('🎉 Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testContactDB();
