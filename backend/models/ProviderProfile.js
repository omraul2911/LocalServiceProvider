const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  experience: { type: String },
  location: { type: String },
  services: [{
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true }
  }],
  availability: [{
    day: { type: String }, // e.g., 'Monday'
    slots: [{ type: String }] // e.g., ['09:00', '10:00']
  }],
  portfolioImages: [{ type: String }], // Cloudinary URLs
  stats: {
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
