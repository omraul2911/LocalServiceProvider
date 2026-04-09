const express = require('express');
const router = express.Router();
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { protect, providerOnly } = require('../middleware/authMiddleware');

// Get all providers (Search)
router.get('/', async (req, res) => {
  try {
    const { keyword, location } = req.query;
    
    // Simple text search for services and location
    const query = {};
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (keyword) {
      query['services.title'] = { $regex: keyword, $options: 'i' };
    }

    const providers = await ProviderProfile.find(query).populate('userId', 'name email');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get provider profile by id
router.get('/:id', async (req, res) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate('userId', 'name email');
    if (provider) {
      res.json(provider);
    } else {
      res.status(404).json({ message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current provider profile
router.get('/profile/me', protect, providerOnly, async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id }).populate('userId', 'name email');
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update provider profile
router.put('/profile', protect, providerOnly, async (req, res) => {
  try {
    const { experience, location, services, availability, portfolioImages } = req.body;
    
    let profile = await ProviderProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      // Update
      profile.experience = experience || profile.experience;
      profile.location = location || profile.location;
      profile.services = services || profile.services;
      profile.availability = availability || profile.availability;
      if (portfolioImages) {
        profile.portfolioImages = portfolioImages;
      }
      
      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      // Create
      profile = await ProviderProfile.create({
        userId: req.user._id,
        experience,
        location,
        services,
        availability,
        portfolioImages
      });
      res.status(201).json(profile);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Provider Analytics
router.get('/analytics/dashboard', protect, providerOnly, async (req, res) => {
  try {
    const providerId = req.user._id;

    const bookings = await Booking.find({ providerId });
    const reviews = await Review.find({ providerId });

    const totalBookings = bookings.length;
    const completedJobs = bookings.filter(b => b.status === 'Completed').length;
    const pendingRequests = bookings.filter(b => b.status === 'Requested').length;
    
    const totalEarnings = bookings
      .filter(b => b.status === 'Completed')
      .reduce((sum, b) => sum + Number(b.price || 0), 0);

    const averageRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
      : 0;

    const statusObj = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.keys(statusObj).map(status => ({
        name: status,
        value: statusObj[status]
    }));

    const dateObj = bookings.reduce((acc, booking) => {
      if (booking.date) {
        acc[booking.date] = (acc[booking.date] || 0) + 1;
      }
      return acc;
    }, {});
    
    const bookingsOverTime = Object.keys(dateObj)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        count: dateObj[date]
      }));

    res.json({
      totalBookings,
      completedJobs,
      pendingRequests,
      totalEarnings,
      averageRating: parseFloat(averageRating),
      bookingsOverTime,
      statusDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
