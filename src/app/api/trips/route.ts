import { NextRequest, NextResponse } from 'next/server';

// Mock trips data - In a real app, this would come from your database
const mockTrips = [
  {
    id: '1',
    villa: {
      id: '1',
      name: 'Luxury Villa with Pool',
      location: 'Karjat, Maharashtra',
      images: ['/villa.jpg']
    },
    checkIn: '2025-08-15',
    checkOut: '2025-08-17',
    guests: 4,
    totalAmount: 25000,
    status: 'confirmed',
    bookingDate: '2025-07-20'
  },
  {
    id: '2',
    villa: {
      id: '2',
      name: 'Cozy Mountain Retreat',
      location: 'Lonavala, Maharashtra',
      images: ['/villa.jpg']
    },
    checkIn: '2025-06-10',
    checkOut: '2025-06-12',
    guests: 2,
    totalAmount: 18000,
    status: 'completed',
    bookingDate: '2025-05-15'
  },
  {
    id: '3',
    villa: {
      id: '3',
      name: 'Beachside Villa',
      location: 'Alibaug, Maharashtra',
      images: ['/villa.jpg']
    },
    checkIn: '2025-09-05',
    checkOut: '2025-09-08',
    guests: 6,
    totalAmount: 45000,
    status: 'confirmed',
    bookingDate: '2025-07-25'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Get the user ID from authentication
    // 2. Query your database for the user's trips
    // 3. Return the trips data
    
    // For now, we'll simulate a database query with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      trips: mockTrips
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
    const body = await request.json();
    const { action, tripId } = body;
    
    if (action === 'cancel' && tripId) {
      // In a real app, update the trip status in the database
      // For now, we'll just simulate the cancellation
      
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
