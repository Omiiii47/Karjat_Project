import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const bookingData = await request.json();

    // Validate required fields
    if (!bookingData.userId || !bookingData.villaId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: userId and villaId are required' },
        { status: 400 }
      );
    }

    // Create booking request with pending status
    const bookingRequest = await BookingRequest.create({
      ...bookingData,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request created successfully',
      bookingRequestId: bookingRequest._id,
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create booking request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const bookingRequests = await BookingRequest.find(filter)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      bookingRequests,
    });
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking requests' },
      { status: 500 }
    );
  }
}
