const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, providerOnly } = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');

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


// Generate Receipt PDF
router.get('/:id/receipt', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('customerId providerId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isProvider = booking.providerId._id.toString() === req.user._id.toString();
    
    if (!isCustomer && !isProvider) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Receipt can only be generated for completed bookings' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${booking._id}.pdf`);
    
    doc.pipe(res);
    
    doc.fontSize(25).text('Booking Receipt', { align: 'center' });
    doc.moveDown();
    
    doc.moveTo(50, 110).lineTo(550, 110).stroke();
    doc.moveDown(2);
    
    doc.fontSize(14).font('Helvetica-Bold').text('Booking Details');
    doc.fontSize(12).font('Helvetica')
       .text(`Receipt ID: ${booking._id}`)
       .text(`Date & Time: ${booking.date} | ${booking.timeSlot}`)
       .text(`Status: ${booking.status}`);
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text('Service Details');
    doc.fontSize(12).font('Helvetica')
       .text(`Service: ${booking.serviceTitle}`)
       .text(`Total Amount: $${booking.price.toFixed(2)}`);
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text('Service Provider');
    doc.fontSize(12).font('Helvetica')
       .text(`Name: ${booking.providerId.name}`)
       .text(`Email: ${booking.providerId.email}`);
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica-Bold').text('Customer');
    doc.fontSize(12).font('Helvetica')
       .text(`Name: ${booking.customerId.name}`)
       .text(`Email: ${booking.customerId.email}`);
    
    doc.moveDown(4);
    doc.fontSize(10).fillColor('gray').text('Thank you for using Local Service Provider platform.', { align: 'center' });
    
    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
