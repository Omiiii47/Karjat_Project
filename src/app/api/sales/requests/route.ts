import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';

// GET - Get all booking requests for sales team
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const bookingRequests = await BookingRequest.find({ status })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      bookingRequests
    });
  } catch (error: any) {
    console.error('Error fetching booking requests:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch booking requests' },
      { status: 500 }
    );
  }
}
