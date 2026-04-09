const express = require('express');
const router = express.Router();
const ProviderProfile = require('../models/ProviderProfile');
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

module.exports = router;
