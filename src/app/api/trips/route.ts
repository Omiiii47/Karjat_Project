import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const authHeader = request.headers.get('authorization');
    const userToken = getUserFromToken(authHeader);
    
    if (!userToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const bookingsCollection = db.collection('bookings');
    const villasCollection = db.collection('villas');

    // Get user's bookings with villa details
    const bookings = await bookingsCollection.aggregate([
      { $match: { userId: new ObjectId(userToken.userId) } },
      {
        $lookup: {
          from: 'villas',
          localField: 'villaId',
          foreignField: '_id',
          as: 'villa'
        }
      },
      { $unwind: '$villa' },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Transform to match your current Trip interface
    const trips = bookings.map(booking => ({
      id: booking._id.toString(),
      villa: {
        id: booking.villa._id.toString(),
        name: booking.villa.name,
        location: booking.villa.location,
        images: booking.villa.images || ['/villa.jpg']
      },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalAmount: booking.totalAmount,
      status: booking.status,
      bookingDate: booking.createdAt
    }));

    return NextResponse.json({
      success: true,
      trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const authHeader = request.headers.get('authorization');
    const userToken = getUserFromToken(authHeader);
    
    if (!userToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, tripId } = body;
    
    if (action === 'cancel' && tripId) {
      const db = await getDatabase();
      const bookingsCollection = db.collection('bookings');
      
      // Update booking status to cancelled
      const result = await bookingsCollection.updateOne(
        { 
          _id: new ObjectId(tripId),
          userId: new ObjectId(userToken.userId) // Ensure user can only cancel their own bookings
        },
        { 
          $set: { 
            status: 'cancelled',
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Booking not found or unauthorized' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Trip cancelled successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}
