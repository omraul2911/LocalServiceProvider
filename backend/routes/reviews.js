const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const { protect } = require('../middleware/authMiddleware');

// Post a review
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, providerId, rating, comment, images } = req.body;
    
    // Check if booking is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'Completed') return res.status(400).json({ message: 'Can only review completed bookings' });
    if (booking.customerId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Unauthorized' });

    // Ensure no duplicate reviews
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) return res.status(400).json({ message: 'Review already submitted for this booking' });

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId,
      rating,
      comment,
      images
    });

    // Update ProviderStats
    const profile = await ProviderProfile.findOne({ userId: providerId });
    if (profile) {
      const allReviews = await Review.find({ providerId });
      const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
      profile.stats.rating = avgRating;
      profile.stats.reviewCount = allReviews.length;
      profile.stats.jobsCompleted += 1;
      await profile.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a provider
router.get('/provider/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.params.id }).populate('customerId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
