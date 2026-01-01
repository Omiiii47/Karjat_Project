import mongoose from 'mongoose';
import connectAdminDB from '@/lib/admin-db';

const AdminUserSchema = new mongoose.Schema({
  // User Authentication Details
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, immutable: true }, // Unique username
  password: { type: String }, // For users who register normally
  name: { type: String, required: true },
  phone: { type: String },
  
  // User Profile Details
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String }
  },
  
  // Authentication Details
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  
  // Login Tracking
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  ipAddress: { type: String },
  userAgent: { type: String },
  
  // Preferences
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true }
  },
  
  // Social Login
  googleId: { type: String },
  facebookId: { type: String },
  
  // Admin Notes
  adminNotes: { type: String },
  tags: [{ type: String }],
  
}, {
  timestamps: true,
  collection: 'users' // Explicit collection name
});

// Create model with admin database connection
let AdminUser: mongoose.Model<any>;

const getAdminUserModel = async () => {
  if (AdminUser) {
    return AdminUser;
  }
  
  const adminConnection = await connectAdminDB();
  
  // Check if model already exists on this connection
  if (adminConnection.models.AdminUser) {
    AdminUser = adminConnection.models.AdminUser;
  } else {
    AdminUser = adminConnection.model('AdminUser', AdminUserSchema);
  }
  
  return AdminUser;
};

export default getAdminUserModel;
