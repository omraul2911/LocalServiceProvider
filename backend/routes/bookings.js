const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, providerOnly } = require('../middleware/authMiddleware');

// Request a new booking
router.post('/', protect, async (req, res) => {
  try {
    const { providerId, serviceTitle, price, date, timeSlot } = req.body;
    
    // Simple validation could be added here to check overlapping
    
    const booking = await Booking.create({
      customerId: req.user._id,
      providerId,
      serviceTitle,
      price,
      date,
      timeSlot,
      status: 'Requested'
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's bookings (Customer or Provider)
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'provider' 
      ? { providerId: req.user._id } 
      : { customerId: req.user._id };
      
    const bookings = await Booking.find(query).populate('customerId providerId', 'name email').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status (State Machine)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Authorization
    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isProvider = booking.providerId.toString() === req.user._id.toString();
    
    if (!isCustomer && !isProvider) {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    // Basic state transition validation could be added here.
    // e.g. Customer can cancel, Provider can Accept/Reject/Completion Requested, Customer can Complete
    booking.status = status;
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
