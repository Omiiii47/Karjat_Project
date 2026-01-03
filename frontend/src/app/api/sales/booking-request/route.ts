import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';

// POST - Create booking request (from customer)
export async function POST(request: NextRequest) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', body);

    console.log('Creating booking request...');
    const bookingRequest = await BookingRequest.create({
      ...body,
      status: 'pending'
    });
    
    console.log('Booking request created:', bookingRequest._id);

    return NextResponse.json({
      success: true,
      bookingRequestId: bookingRequest._id,
      message: 'Booking request submitted successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking request:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create booking request', error: error.toString() },
      { status: 500 }
    );
  }
}

// GET - Check status of booking request or get all requests for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // If userId is provided, return all bookings for that user
    if (userId) {
      const bookingRequests = await BookingRequest.find({ userId })
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        bookingRequests
      });
    }

    // If id is provided, return specific booking
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking request ID or userId is required' },
        { status: 400 }
      );
    }

    const bookingRequest = await BookingRequest.findById(id);

    if (!bookingRequest) {
      return NextResponse.json(
        { success: false, message: 'Booking request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: bookingRequest.status,
      salesResponse: bookingRequest.salesResponse,
      bookingRequest
    });
  } catch (error: any) {
    console.error('Error fetching booking request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch booking request' },
      { status: 500 }
    );
  }
}

// PUT - Update booking request (e.g., mark as paid)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { bookingRequestId, paymentStatus, bookingId } = body;

    console.log('PUT /api/sales/booking-request - Request body:', body);

    if (!bookingRequestId) {
      console.error('PUT /api/sales/booking-request - Missing bookingRequestId');
      return NextResponse.json(
        { success: false, message: 'Booking request ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (bookingId) updateData.bookingId = bookingId;

    console.log('PUT /api/sales/booking-request - Updating with data:', updateData);

    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      bookingRequestId,
      updateData,
      { new: true }
    );

    if (!bookingRequest) {
      console.error('PUT /api/sales/booking-request - Booking request not found:', bookingRequestId);
      return NextResponse.json(
        { success: false, message: 'Booking request not found' },
        { status: 404 }
      );
    }

    console.log('PUT /api/sales/booking-request - Successfully updated:', bookingRequest._id);

    return NextResponse.json({
      success: true,
      bookingRequest,
      message: 'Booking request updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/sales/booking-request - Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update booking request' },
      { status: 500 }
    );
  }
}
