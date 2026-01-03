import { NextRequest, NextResponse } from 'next/server';
import getAdminBookingModel from '@/models/AdminBooking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminBooking = await getAdminBookingModel();
    
    const booking = await AdminBooking.findById(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);

  } catch (error) {
    console.error('Error fetching admin booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const AdminBooking = await getAdminBookingModel();
    
    const booking = await AdminBooking.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date(), lastModifiedBy: 'admin' },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Error updating admin booking:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid booking data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminBooking = await getAdminBookingModel();
    
    const booking = await AdminBooking.findByIdAndDelete(params.id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
