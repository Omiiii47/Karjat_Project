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

// GET - Check status of booking request
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking request ID is required' },
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
