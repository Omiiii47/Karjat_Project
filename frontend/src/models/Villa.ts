import mongoose from 'mongoose';

const VillaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  features: [{ type: String }],
  location: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  amenities: [{ type: String }],
}, {
  timestamps: true
});

export default mongoose.models.Villa || mongoose.model('Villa', VillaSchema);
