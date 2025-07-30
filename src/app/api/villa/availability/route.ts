import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';

export async function POST(request: NextRequest) {
  try {
    const { villaId, checkInDate, checkOutDate } = await request.json();

    if (!villaId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { success: false, message: 'Villa ID, check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, message: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    let conflictingBookings = [];
    let useDatabase = false;

    try {
      // Try to connect to database
      await connectDB();
      useDatabase = true;

      // Find conflicting bookings - bookings that overlap with the requested dates
      conflictingBookings = await Booking.find({
        villaId: villaId,
        bookingStatus: { $in: ['pending', 'confirmed'] }, // Only check non-cancelled bookings
        $or: [
          {
            // Booking starts before requested period ends and ends after requested period starts
            checkInDate: { $lt: checkOut },
            checkOutDate: { $gt: checkIn }
          }
        ]
      }).select('checkInDate checkOutDate bookingReference guestName');

    } catch (dbError) {
      console.log('Database connection failed, assuming available');
    }

    const isAvailable = conflictingBookings.length === 0;

    return NextResponse.json({
      success: true,
      available: isAvailable,
      conflictingBookings: useDatabase ? conflictingBookings : [],
      message: isAvailable 
        ? 'Villa is available for the selected dates' 
        : `Villa is not available for the selected dates. ${conflictingBookings.length} conflicting booking(s) found.`
    });

  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const villaId = searchParams.get('villaId');
    const months = parseInt(searchParams.get('months') || '3');

    if (!villaId) {
      return NextResponse.json(
        { success: false, message: 'Villa ID is required' },
        { status: 400 }
      );
    }

    let bookedDates = [];
    let useDatabase = false;

    try {
      await connectDB();
      useDatabase = true;

      // Get all bookings for the next few months
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setMonth(futureDate.getMonth() + months);

      const bookings = await Booking.find({
        villaId: villaId,
        bookingStatus: { $in: ['pending', 'confirmed'] },
        checkInDate: { $gte: today },
        checkOutDate: { $lte: futureDate }
      }).select('checkInDate checkOutDate');

      // Convert booking date ranges to individual dates
      bookedDates = bookings.flatMap(booking => {
        const dates = [];
        const current = new Date(booking.checkInDate);
        const end = new Date(booking.checkOutDate);

        while (current < end) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
        return dates;
      });

    } catch (dbError) {
      console.log('Database connection failed, returning no booked dates');
    }

    return NextResponse.json({
      success: true,
      bookedDates: bookedDates,
      villaId: villaId
    });

  } catch (error: any) {
    console.error('Error fetching booked dates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booked dates' },
      { status: 500 }
    );
  }
}
