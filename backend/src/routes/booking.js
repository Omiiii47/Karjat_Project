const express = require('express');
const router = express.Router();
const BookingRequest = require('../models/BookingRequest');

// Submit new booking request
router.post('/request', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Auto-approve if booking type is 'pay' (direct payment)
    if (bookingData.bookingType === 'pay') {
      bookingData.status = 'accepted';
    }
    
    const bookingRequest = new BookingRequest(bookingData);
    await bookingRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      bookingRequestId: bookingRequest._id,
      status: bookingRequest.status
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit booking request'
    });
  }
});

// Get booking request status
router.get('/request/:id', async (req, res) => {
  try {
    const bookingRequest = await BookingRequest.findById(req.params.id);
    
    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }
    
    res.json({
      success: true,
      status: bookingRequest.status,
      bookingRequest
    });
  } catch (error) {
    console.error('Error fetching booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking request'
    });
  }
});

module.exports = router;
