const express = require('express');
const router = express.Router();
const BookingRequest = require('../models/BookingRequest');

// Get all booking requests by status
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const bookingRequests = await BookingRequest.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookingRequests
    });
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking requests'
    });
  }
});

// Update booking request status (accept/decline)
router.patch('/requests/:id', async (req, res) => {
  try {
    const { action } = req.body;
    const status = action === 'accept' ? 'accepted' : 'declined';
    
    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }
    
    res.json({
      success: true,
      message: `Booking request ${status}`,
      bookingRequest
    });
  } catch (error) {
    console.error('Error updating booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking request'
    });
  }
});

// Login endpoint for sales team
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get sales credentials from environment variables
    const salesEmail = process.env.SALES_EMAIL;
    const salesPassword = process.env.SALES_PASSWORD;
    
    if (!salesEmail || !salesPassword) {
      return res.status(500).json({
        success: false,
        message: 'Sales credentials not configured'
      });
    }
    
    if (email !== salesEmail || password !== salesPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid sales credentials'
      });
    }
    
    const salesUser = {
      _id: 'sales-user-id',
      firstName: 'Sales',
      lastName: 'Team',
      email: salesEmail,
      role: 'sales'
    };
    
    res.json({
      success: true,
      message: 'Sales login successful',
      user: salesUser,
      token: 'sales-token-' + Date.now()
    });
  } catch (error) {
    console.error('Sales login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
