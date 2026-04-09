const axios = require('axios');
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/local_services_platform');
  const Booking = require('./backend/models/Booking');

  const booking = await Booking.findOne({ status: 'Completed' });
  if (!booking) {
    console.log("No completed booking found to test.");
    process.exit(0);
  }

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
