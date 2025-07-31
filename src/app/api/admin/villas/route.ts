import { NextRequest, NextResponse } from 'next/server';
import getAdminVillaModel from '@/models/AdminVilla';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const AdminVilla = await getAdminVillaModel();

    // Build query
    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    // Get total count
    const total = await AdminVilla.countDocuments(query);

    // Get villas with pagination
    const villas = await AdminVilla.find(query)
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
    console.error('Error fetching admin villas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch villas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Villa creation request received');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
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

    console.log('Extracted fields:', {
      name,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      maxGuests,
      images: images?.length,
      features: features?.length,
      amenities: amenities?.length
    });

    // Validate required fields
    if (!name || !description || !price || !location) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Name, description, price, and location are required' },
        { status: 400 }
      );
    }

    console.log('Getting AdminVilla model...');
    const AdminVilla = await getAdminVillaModel();
    console.log('AdminVilla model obtained');

    // Create new villa in admin database
    const villaData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      images: (images || [])
        .filter((url: string) => url && url.trim() !== '') // Remove empty URLs
        .map((url: string, index: number) => ({
          url: url.trim(),
          caption: '',
          isMain: index === 0, // First image is the main image
          category: 'general'
        })),
      features: features || [],
      location: location.trim(),
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      maxGuests: parseInt(maxGuests) || 1,
      amenities: amenities || [],
      isActive: true,
      isPublished: true, // Auto-publish new villas so they appear to users
      lastModifiedBy: 'admin'
    };

    console.log('Creating villa with data:', villaData);
    const villa = new AdminVilla(villaData);

    console.log('Saving villa...');
    const savedVilla = await villa.save();
    console.log('Villa saved successfully:', savedVilla._id);

    return NextResponse.json(
      {
        message: 'Villa created successfully',
        villa: savedVilla
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating villa - Full error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && error.message.includes('validation')) {
      console.log('Validation error detected');
      return NextResponse.json(
        { error: 'Invalid villa data provided: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create villa: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
