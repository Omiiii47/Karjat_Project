import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import Villa from '@/models/Villa';
import getAdminVillaModel from '@/models/AdminVilla';
import { connectAdminDB } from '@/lib/admin-db';
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
    
    // Add detailed logging
    console.log('=== BOOKING REQUEST DEBUG ===');
    console.log('Villa ID received:', bookingData.villaId);
    console.log('Villa Name received:', bookingData.villaName);
    console.log('Full booking data:', JSON.stringify(bookingData, null, 2));
    
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
        console.log(`Missing required field: ${field}`);
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Verify villa exists (check admin DB, regular DB, and sample data)
    let villa = null;
    let villaMaxGuests = 0;
    let useDatabase = false;
    let useAdminDB = false;
    
    // First, try to connect to admin database for admin-created villas
    try {
      const adminConnection = await connectAdminDB();
      if (adminConnection.readyState === 1) {
        useAdminDB = true;
        console.log('Admin database connection successful');
        
        // Check if it's a MongoDB ObjectId (24 character hex string)
        if (bookingData.villaId.length === 24 && /^[0-9a-fA-F]{24}$/.test(bookingData.villaId)) {
          try {
            const AdminVilla = await getAdminVillaModel();
            const adminVilla = await AdminVilla.findById(bookingData.villaId);
            if (adminVilla && adminVilla.isActive && adminVilla.isPublished) {
              console.log('Villa found in admin database:', adminVilla.name);
              villa = {
                id: adminVilla._id.toString(),
                name: adminVilla.name,
                maxGuests: adminVilla.maxGuests,
                price: adminVilla.price
              };
              villaMaxGuests = adminVilla.maxGuests;
            }
          } catch (err) {
            console.log('Error searching admin database:', err);
          }
        }
      }
    } catch (adminDbError) {
      console.log('Admin database connection failed');
    }
    
    // If not found in admin DB, try regular database
    if (!villa) {
      try {
        await connectDB();
        useDatabase = true;
        console.log('Regular database connection successful');
      } catch (dbError) {
        console.log('Regular database connection failed');
      }
      
      // Check if it's a MongoDB ObjectId (24 character hex string)
      if (useDatabase && bookingData.villaId.length === 24 && /^[0-9a-fA-F]{24}$/.test(bookingData.villaId)) {
        // Try MongoDB first
        try {
          console.log('Looking for villa in regular MongoDB with ID:', bookingData.villaId);
          const dbVilla = await Villa.findById(bookingData.villaId);
          if (dbVilla) {
            console.log('Villa found in regular MongoDB:', dbVilla.name);
            villa = dbVilla;
            villaMaxGuests = dbVilla.maxGuests;
          } else {
            console.log('Villa not found in regular MongoDB');
          }
        } catch (err) {
          console.log('Error searching regular MongoDB:', err);
        }
      } else {
        console.log('Villa ID is not a MongoDB ObjectId, checking sample data');
      }
    }
    
    // If not found in MongoDB, check sample data
    if (!villa) {
      console.log('Searching sample villas for ID:', bookingData.villaId);
      console.log('Available sample villa IDs:', sampleVillas.map(v => v.id));
      
      const sampleVilla = sampleVillas.find(v => v.id === bookingData.villaId);
      if (sampleVilla) {
        console.log('Villa found in sample data:', sampleVilla.name);
        villa = sampleVilla;
        villaMaxGuests = sampleVilla.maxGuests;
      } else {
        console.log('Villa not found in sample data either');
      }
    }
    
    if (!villa) {
      console.log('Villa not found anywhere - returning 404');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Villa not found',
          debug: {
            villaId: bookingData.villaId,
            sampleVillaIds: sampleVillas.map(v => v.id),
            useDatabase,
            useAdminDB,
            isMongoId: bookingData.villaId.length === 24 && /^[0-9a-fA-F]{24}$/.test(bookingData.villaId)
          }
        },
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

    // NOTE: Guest count validation removed to avoid blocking payment/custom offers.
    // Create booking
    if (useAdminDB) {
      // Save to Admin Database for admin-created villas
      const getAdminBookingModel = (await import('@/models/AdminBooking')).default;
      const AdminBooking = await getAdminBookingModel();
      
      // Determine booking and payment status based on bookingType
      const isPaidBooking = bookingData.bookingType === 'pay';
      const bookingStatus = isPaidBooking ? 'confirmed' : 'pending';
      const paymentStatus = isPaidBooking ? 'paid' : 'pending';
      const paidAmount = isPaidBooking ? bookingData.totalAmount : 0;
      const balanceAmount = isPaidBooking ? 0 : bookingData.totalAmount;
      
      const adminBooking = new AdminBooking({
        villaId: bookingData.villaId,
        villaName: bookingData.villaName,
        userId: authenticatedUser?.userId || `guest_${Date.now()}`,
        customerDetails: {
          name: bookingData.guestName,
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone
        },
        totalGuests: bookingData.numberOfGuests,
        adults: bookingData.numberOfGuests,
        children: 0,
        infants: 0,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfNights: bookingData.numberOfNights,
        pricing: {
          basePrice: bookingData.pricePerNight,
          totalBaseAmount: bookingData.pricePerNight * bookingData.numberOfNights,
          totalAmount: bookingData.totalAmount,
          paidAmount: paidAmount,
          balanceAmount: balanceAmount
        },
        paymentDetails: {
          paymentStatus: paymentStatus
        },
        bookingStatus: bookingStatus,
        canBeCancelled: !isPaidBooking, // Cannot cancel if paid
        specialRequests: bookingData.specialRequests,
        bookingSource: 'website'
      });
      
      await adminBooking.save();
      
      return NextResponse.json({
        success: true,
        booking: {
          _id: adminBooking._id,
          bookingReference: adminBooking.bookingId,
          bookingStatus: adminBooking.bookingStatus,
          paymentStatus: adminBooking.paymentDetails.paymentStatus
        },
        message: 'Booking created successfully'
      }, { status: 201 });
      
    } else if (useDatabase) {
      // Save to regular MongoDB for regular villas
      const booking = new Booking({
        villaId: bookingData.villaId,
        villaName: bookingData.villaName,
        userId: authenticatedUser?.userId || null,
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
        userId: authenticatedUser?.userId || null,
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
