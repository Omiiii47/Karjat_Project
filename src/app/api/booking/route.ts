import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import Villa from '@/models/Villa';
import { BookingFormData } from '@/types/booking';
import { sampleVillas } from '@/utils/helpers';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingFormData = await request.json();
    
    // Get authenticated user if available
    const authenticatedUser = getUserFromToken(request);
    
    // Validate required fields
    const requiredFields = [
      'villaId', 'villaName', 'guestName', 'guestEmail', 'guestPhone',
      'checkInDate', 'checkOutDate', 'numberOfGuests', 'numberOfNights',
      'pricePerNight', 'totalAmount'
    ];
    
    for (const field of requiredFields) {
      if (!bookingData[field as keyof BookingFormData]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Verify villa exists (check both MongoDB and sample data)
    let villa = null;
    let villaMaxGuests = 0;
    let useDatabase = false;
    
    try {
      // Try to connect to database
      await connectDB();
      useDatabase = true;
    } catch (dbError) {
      console.log('Database connection failed, using sample data only');
    }
    
    // Check if it's a MongoDB ObjectId (24 character hex string)
    if (useDatabase && bookingData.villaId.length === 24 && /^[0-9a-fA-F]{24}$/.test(bookingData.villaId)) {
      // Try MongoDB first
      try {
        villa = await Villa.findById(bookingData.villaId);
        if (villa) {
          villaMaxGuests = villa.maxGuests;
        }
      } catch (err) {
        console.log('Villa not found in database, checking sample data');
      }
    }
    
    // If not found in MongoDB, check sample data
    if (!villa) {
      const sampleVilla = sampleVillas.find(v => v.id === bookingData.villaId);
      if (sampleVilla) {
        villa = sampleVilla;
        villaMaxGuests = sampleVilla.maxGuests;
      }
    }
    
    if (!villa) {
      return NextResponse.json(
        { success: false, message: 'Villa not found' },
        { status: 404 }
      );
    }
    
    // Validate dates
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      return NextResponse.json(
        { success: false, message: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }
    
    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, message: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }
    
    // Validate guest count
    if (bookingData.numberOfGuests > villaMaxGuests) {
      return NextResponse.json(
        { success: false, message: `Maximum ${villaMaxGuests} guests allowed for this villa` },
        { status: 400 }
      );
    }
    
    // Create booking
    if (useDatabase) {
      // Save to MongoDB
      const booking = new Booking({
        villaId: bookingData.villaId,
        villaName: bookingData.villaName,
        userId: authenticatedUser?.userId || null, // Add userId if user is logged in
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: bookingData.numberOfGuests,
        numberOfNights: bookingData.numberOfNights,
        pricePerNight: bookingData.pricePerNight,
        totalAmount: bookingData.totalAmount,
        specialRequests: bookingData.specialRequests,
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        bookingReference: 'VB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
      });
      
      await booking.save();
      
      return NextResponse.json({
        success: true,
        booking: booking,
        message: 'Booking created successfully'
      }, { status: 201 });
    } else {
      // Return mock booking for development
      const mockBooking = {
        _id: 'mock_' + Date.now(),
        villaId: bookingData.villaId,
        villaName: bookingData.villaName,
        userId: authenticatedUser?.userId || null, // Add userId if user is logged in
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: bookingData.numberOfGuests,
        numberOfNights: bookingData.numberOfNights,
        pricePerNight: bookingData.pricePerNight,
        totalAmount: bookingData.totalAmount,
        specialRequests: bookingData.specialRequests,
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        bookingReference: 'VB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        booking: mockBooking,
        message: 'Booking created successfully (development mode)'
      }, { status: 201 });
    }
    
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    
    // Build query
    const query: any = {};
    if (status) query.bookingStatus = status;
    if (email) query.guestEmail = { $regex: email, $options: 'i' };
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('villaId', 'name location images pricePerNight')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);
    
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
