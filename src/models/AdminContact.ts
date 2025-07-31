import mongoose from 'mongoose';
import connectAdminDB from '@/lib/admin-db';

const AdminContactSchema = new mongoose.Schema({
  // User Information
  userId: { type: String }, // User ID if logged in user submitted contact form
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  
  // Contact Details
  subject: { type: String },
  message: { type: String, required: true },
  inquiryType: { 
    type: String, 
    enum: ['general', 'booking', 'support', 'complaint', 'suggestion', 'partnership'],
    default: 'general'
  },
  
  // Villa Related (if inquiry is about specific villa)
  relatedVillaId: { type: String },
  relatedVillaName: { type: String },
  
  // Status Management
  status: { 
    type: String, 
    enum: ['new', 'in-progress', 'resolved', 'closed', 'follow-up-required'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Admin Management
  assignedTo: { type: String }, // Admin user ID who is handling this
  adminResponse: { type: String },
  adminNotes: { type: String },
  responseDate: { type: Date },
  resolvedDate: { type: Date },
  
  // Communication Tracking
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  communicationHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'sms', 'internal-note'] },
    message: { type: String },
    sentBy: { type: String }, // Admin ID or 'system'
  }],
  
  // Technical Details
  userAgent: { type: String },
  ipAddress: { type: String },
  referrerUrl: { type: String },
  
  // Customer Satisfaction
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  
}, {
  timestamps: true,
  collection: 'contact_us' // Explicit collection name
});

// Create model with admin database connection
let AdminContact: mongoose.Model<any>;

const getAdminContactModel = async () => {
  if (AdminContact) {
    return AdminContact;
  }
  
  const adminConnection = await connectAdminDB();
  
  // Check if model already exists on this connection
  if (adminConnection.models.AdminContact) {
    AdminContact = adminConnection.models.AdminContact;
  } else {
    AdminContact = adminConnection.model('AdminContact', AdminContactSchema);
  }
  
  return AdminContact;
};

export default getAdminContactModel;
