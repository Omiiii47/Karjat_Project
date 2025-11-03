import { NextRequest, NextResponse } from 'next/server';
import { connectAdminDB } from '@/lib/admin-db';
import getAdminBookingModel from '@/models/AdminBooking';
import getAdminVillaModel from '@/models/AdminVilla';
import jwt from 'jsonwebtoken';

// Helper to get user from token
function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching trips...');
    
    // Get user from token
    const userToken = getUserFromToken(request);
    
    if (!userToken) {
      console.log('❌ No valid token found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', userToken.email);

    // Connect to admin database
    await connectAdminDB();
    const AdminBooking = await getAdminBookingModel();
    const AdminVilla = await getAdminVillaModel();

    // Get ALL bookings for this user (regardless of payment status)
    // Match by userId OR email (for guest bookings)
    const bookings = await AdminBooking.find({
      $or: [
        { userId: userToken.userId },
        { 'customerDetails.email': userToken.email }
      ]
    }).sort({ createdAt: -1 });

    console.log(`📋 Found ${bookings.length} bookings for user ${userToken.email}`);

    // Get villa details for each booking
    const tripsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        let villaDetails = null;
        
        try {
          villaDetails = await AdminVilla.findById(booking.villaId);
        } catch (err) {
          console.log(`⚠️ Villa not found for booking ${booking._id}`);
        }

        return {
          id: booking._id.toString(),
          villa: {
            id: booking.villaId,
            name: booking.villaName,
            location: villaDetails?.location || 'Location not available',
            images: villaDetails?.images || ['/villa-placeholder.jpg']
          },
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          guests: booking.totalGuests,
          totalAmount: booking.pricing.totalAmount,
          status: booking.bookingStatus, // Show booking status (pending, confirmed, cancelled)
          paymentStatus: booking.paymentDetails?.paymentStatus || 'pending',
          bookingDate: booking.createdAt,
          bookingReference: booking.bookingId
        };
      })
    );

    console.log('✅ Trips data prepared successfully');

    return NextResponse.json({
      success: true,
      trips: tripsWithDetails
    });
  } catch (error) {
    console.error('❌ Error fetching trips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const userToken = getUserFromToken(request);
    
    if (!userToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, tripId } = body;
    
    if (action === 'cancel' && tripId) {
      await connectAdminDB();
      const AdminBooking = await getAdminBookingModel();
      
      // Update booking status to cancelled
      const result = await AdminBooking.updateOne(
        { 
          _id: tripId,
          $or: [
            { userId: userToken.userId },
            { 'customerDetails.email': userToken.email }
          ]
        },
        { 
          $set: { 
            bookingStatus: 'cancelled',
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Booking not found or unauthorized' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Trip cancelled successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}
