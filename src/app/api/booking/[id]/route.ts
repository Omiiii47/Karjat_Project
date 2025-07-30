import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const booking = await Booking.findById(params.id)
      .populate('villaId', 'name location images pricePerNight amenities');
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking
    });
    
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const updates = await request.json();
    
    // Only allow certain fields to be updated
    const allowedUpdates = [
      'bookingStatus',
      'paymentStatus',
      'specialRequests',
      'guestName',
      'guestEmail',
      'guestPhone'
    ];
    
    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    const booking = await Booking.findByIdAndUpdate(
      params.id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).populate('villaId', 'name location images pricePerNight');
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const booking = await Booking.findByIdAndDelete(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
