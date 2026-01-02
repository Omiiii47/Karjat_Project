const express = require('express');
const router = express.Router();
const BookingRequest = require('../models/BookingRequest');
const { authenticateOptional, requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const STAFF_ROLES = ['CALL', 'SALES'];

// Submit new booking request
router.post('/request', authenticateOptional, async (req, res, next) => {
  const bookingData = req.body;

  // Staff-created bookings must be authorized.
  const bookingType = String(bookingData.bookingType || '').toLowerCase();
  const bookingSource = String(bookingData.bookingSource || '').toUpperCase();
  const isStaffBooking = bookingType === 'call' || bookingType === 'sales' || bookingSource === 'CALL' || bookingSource === 'SALES';

  if (isStaffBooking && !req.user) {
    // No JWT present.
    return requireAuth(req, res, next);
  }

  if (isStaffBooking) {
    // JWT present: enforce role CALL/SALES
    return requireRole(STAFF_ROLES)(req, res, () => {
      req.body.createdBy = req.user && req.user.role;
      return next();
    });
  }

  return next();
}, async (req, res) => {
  try {
    const bookingData = req.body;

    // Temporary debug log
    console.log('[booking] create bookingType=', bookingData.bookingType, 'bookingSource=', bookingData.bookingSource, 'createdBy=', bookingData.createdBy);
    
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
