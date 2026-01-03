import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import BookingRequest from '@/models/BookingRequest';

// PATCH - Accept or Decline booking request
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { action } = await request.json();

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "accept" or "decline"' },
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

    if (bookingRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Booking request already processed' },
        { status: 400 }
      );
    }

    bookingRequest.status = action === 'accept' ? 'accepted' : 'declined';
    bookingRequest.salesResponse = {
      action,
      respondedAt: new Date()
    };

    await bookingRequest.save();

    return NextResponse.json({
      success: true,
      message: `Booking request ${action}ed successfully`,
      bookingRequest
    });
  } catch (error: any) {
    console.error('Error updating booking request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update booking request' },
      { status: 500 }
    );
  }
}
