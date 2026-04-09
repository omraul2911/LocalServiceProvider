const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/local_services_platform');
  const Booking = require('./models/Booking');
  const User = require('./models/User'); // ensure models register
  const booking = await Booking.findOne({ status: 'Completed' }).populate('customerId providerId');
  if(!booking) { console.log('no booking'); process.exit(0); }
  
  console.log("Price:", booking.price, "Type:", typeof booking.price);
  
  const PDFDocument = require('pdfkit');
  try {
     const doc = new PDFDocument({ margin: 50 });
     const chunks = [];
     doc.on('data', chunk => chunks.push(chunk));
     doc.on('end', () => { console.log('Successfully generated. Length:', Buffer.concat(chunks).length); process.exit(0); });
     
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
     doc.fontSize(10).fillColor('gray').text('Thank you.', { align: 'center' });
     doc.end();
  } catch(e) {
     console.log('PDF ERROR:', e.message);
  }
}
run();
