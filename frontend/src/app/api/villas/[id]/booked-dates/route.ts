import { NextRequest, NextResponse } from 'next/server';
import { connectAdminDB } from '@/lib/admin-db';
import getAdminBookingModel from '@/models/AdminBooking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const villaId = params.id;
    console.log('📅 Fetching booked dates for villa:', villaId);

    // Connect to admin database
    await connectAdminDB();
    const AdminBooking = await getAdminBookingModel();

    // Get all bookings for this villa (excluding cancelled)
    const bookings = await AdminBooking.find({
      villaId: villaId,
      bookingStatus: { $nin: ['cancelled'] } // Exclude cancelled bookings
    }).select('checkInDate checkOutDate bookingStatus');

    console.log(`Found ${bookings.length} bookings for villa ${villaId}`);

    // Generate array of booked dates with their status
    const bookedDates: Array<{date: string; status: 'confirmed' | 'pending'}> = [];

    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const status = booking.bookingStatus === 'confirmed' ? 'confirmed' : 'pending';

      // Add all dates between check-in and check-out (excluding check-out date)
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateString = currentDate.toISOString().split('T')[0];
        bookedDates.push({ date: dateString, status });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    console.log(`✅ Total booked dates: ${bookedDates.length}`);

    return NextResponse.json({
      success: true,
      bookedDates
    });

  } catch (error) {
    console.error('❌ Error fetching booked dates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch booked dates',
        bookedDates: []
      },
      { status: 500 }
    );
  }
}
