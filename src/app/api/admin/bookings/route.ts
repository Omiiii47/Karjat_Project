import { NextRequest, NextResponse } from 'next/server';
import getAdminBookingModel from '@/models/AdminBooking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    const AdminBooking = await getAdminBookingModel();

    // Build query
    const query: any = {};
    if (status) {
      query.bookingStatus = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Get total count
    const total = await AdminBooking.countDocuments(query);

    // Get bookings with pagination
    const bookings = await AdminBooking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      villaId,
      villaName,
      userId,
      userEmail,
      userName,
      userPhone,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      specialRequests
    } = body;

    // Validate required fields
    if (!villaId || !userId || !userEmail || !checkInDate || !checkOutDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const AdminBooking = await getAdminBookingModel();

    // Create new booking in admin database
    const booking = new AdminBooking({
      villaId,
      villaName: villaName || 'Unknown Villa',
      userId,
      userEmail,
      userName: userName || 'Unknown User',
      userPhone,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests: parseInt(guests) || 1,
      totalAmount: parseFloat(totalAmount),
      specialRequests,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      lastModifiedBy: 'admin'
    });

    const savedBooking = await booking.save();

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: savedBooking
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating admin booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
