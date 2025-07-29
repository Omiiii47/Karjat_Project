import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Villa from '@/models/Villa';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    await connectDB();

    // Build query
    const query: any = {};
    if (!includeInactive) {
      // For public API, only show active villas
      // For admin, this parameter allows viewing all villas
    }

    // Get total count
    const total = await Villa.countDocuments(query);

    // Get villas with pagination
    const villas = await Villa.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      villas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching villas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch villas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      images,
      features,
      location,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities
    } = body;

    // Validate required fields
    if (!name || !description || !price || !location) {
      return NextResponse.json(
        { error: 'Name, description, price, and location are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new villa
    const villa = new Villa({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      images: images || [],
      features: features || [],
      location: location.trim(),
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      maxGuests: parseInt(maxGuests) || 1,
      amenities: amenities || []
    });

    const savedVilla = await villa.save();

    return NextResponse.json(
      {
        message: 'Villa created successfully',
        villa: savedVilla
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating villa:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid villa data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create villa' },
      { status: 500 }
    );
  }
}
