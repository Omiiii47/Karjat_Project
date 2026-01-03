import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import AdminBooking from '@/models/AdminBooking';

// GET - Check if a booking exists for the given criteria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestEmail = searchParams.get('guestEmail');
    const checkInDate = searchParams.get('checkInDate');
    const villaId = searchParams.get('villaId');

    if (!guestEmail || !checkInDate || !villaId) {
      return NextResponse.json(
        { exists: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check in regular Booking collection
    const regularBooking = await Booking.findOne({
      guestEmail: guestEmail.toLowerCase(),
      checkInDate: new Date(checkInDate),
      villaId: villaId,
      paymentStatus: 'paid'
    });

    if (regularBooking) {
      return NextResponse.json({
        exists: true,
        booking: {
          bookingReference: regularBooking.bookingReference,
          bookingStatus: regularBooking.bookingStatus,
          paymentStatus: regularBooking.paymentStatus
        }
      });
    }

    // Check in AdminBooking collection
    const AdminBookingModel = await AdminBooking();
    const adminBooking = await AdminBookingModel.findOne({
      'guestDetails.email': guestEmail.toLowerCase(),
      checkInDate: new Date(checkInDate),
      villaId: villaId,
      'paymentDetails.paymentStatus': 'paid'
    });

    if (adminBooking) {
      return NextResponse.json({
        exists: true,
        booking: {
          bookingReference: adminBooking.bookingId,
          bookingStatus: adminBooking.bookingStatus,
          paymentStatus: adminBooking.paymentDetails.paymentStatus
        }
      });
    }

    return NextResponse.json({
      exists: false,
      message: 'No confirmed booking found'
    });
    
  } catch (error: any) {
    console.error('Error checking booking:', error);
    return NextResponse.json(
      { exists: false, message: 'Failed to check booking' },
      { status: 500 }
    );
  }
}
