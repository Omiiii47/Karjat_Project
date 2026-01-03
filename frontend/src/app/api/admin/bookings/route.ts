import { NextRequest, NextResponse } from 'next/server';
import getAdminBookingModel from '@/models/AdminBooking';
import { connectAdminDB } from '@/lib/admin-db';
import jwt from 'jsonwebtoken';

// Helper function to verify admin token
const verifyAdminToken = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided in request');
      return null;
    }
    
    console.log('🔑 Token received, length:', token.length);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('✅ Token decoded successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isAdmin: decoded.isAdmin
    });
    
    // Accept if either isAdmin is true OR role is 'admin'
    if (decoded.isAdmin === true || decoded.role === 'admin') {
      console.log('✅ Admin access granted');
      return decoded;
    }
    
    console.log('❌ User is not admin. isAdmin:', decoded.isAdmin, 'role:', decoded.role);
    return null;
  } catch (error: any) {
    console.log('❌ Token verification error:', error.message);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = verifyAdminToken(request);
    if (!admin) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    console.log('✅ Admin verified:', admin.email || admin.userId);

    // Connect to admin database
    await connectAdminDB();
    console.log('✅ Connected to admin database');

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

    console.log('📊 Query:', JSON.stringify(query));

    // Get total count
    const total = await AdminBooking.countDocuments(query);
    console.log('📈 Total bookings in database:', total);

    // Get bookings with pagination
    const bookings = await AdminBooking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log('📋 Bookings retrieved for this page:', bookings.length);

    return NextResponse.json({
      success: true,
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
