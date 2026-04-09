const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceTitle: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g., 09:00
  status: {
    type: String,
    enum: ['Requested', 'Accepted', 'In Progress', 'Completion Requested', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Requested'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
