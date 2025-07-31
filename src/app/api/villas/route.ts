import { NextRequest, NextResponse } from 'next/server';
import getAdminVillaModel from '@/models/AdminVilla';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const guests = searchParams.get('guests');

    const AdminVilla = await getAdminVillaModel();

    // Build query for published and active villas only
    const query: any = {
      isActive: true,
      isPublished: true
    };

    // Add filters
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    // Get total count
    const total = await AdminVilla.countDocuments(query);

    // Get villas with pagination
    const villas = await AdminVilla.find(query)
      .select('name description price location bedrooms bathrooms maxGuests images features amenities')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform data for frontend consumption
    const transformedVillas = villas.map((villa: any) => ({
      id: villa._id.toString(),
      name: villa.name,
      description: villa.description,
      price: villa.price,
      location: villa.location,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      maxGuests: villa.maxGuests,
      images: villa.images?.map((img: any) => img.url || img).filter((url: string) => url && url.trim() !== '') || [],
      features: villa.features || [],
      amenities: villa.amenities || []
    }));

    return NextResponse.json({
      villas: transformedVillas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching villas for users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch villas' },
      { status: 500 }
    );
  }
}
