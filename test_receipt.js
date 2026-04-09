const axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/local_services_platform');
  const User = require('./backend/models/User');
  const Booking = require('./backend/models/Booking');

  // Find a completed booking
  const booking = await Booking.findOne({ status: 'Completed' });
  if (!booking) {
    console.log("No completed booking found to test.");
    process.exit(0);
  }

  // Find the customer to get a token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: booking.customerId }, 'supersecretjwtkey_local_services_2026', { expiresIn: '30d' });

  try {
    const res = await axios.get(`http://localhost:5000/api/bookings/${booking._id}/receipt`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Headers:", res.headers);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
  process.exit(0);
}

test();
