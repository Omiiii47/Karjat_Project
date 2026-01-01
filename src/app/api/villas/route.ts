import { NextRequest, NextResponse } from 'next/server';
import getAdminVillaModel from '@/models/AdminVilla';
import { connectAdminDB } from '@/lib/admin-db';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/villas - Starting request');
    
    // Establish connection and wait for it to be ready
    const connection = await connectAdminDB();
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const guests = searchParams.get('guests');
    const includeAll = searchParams.get('includeAll') === 'true'; // For admin use

    const AdminVilla = await getAdminVillaModel();
    console.log('Villa model obtained, querying database...');

    // Build query - for admin, include all villas
    const query: any = {};
    
    // Only filter by active/published status if not admin view
    if (!includeAll) {
      query.isActive = true;
      query.isPublished = true;
    }

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
      .select('name description price location bedrooms bathrooms maxGuests images features amenities isActive isPublished createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform data for frontend consumption
    const transformedVillas = villas.map((villa: any) => {
      const images = villa.images?.map((img: any) => {
        let imageUrl = img.url || img;
        
        // Convert Unsplash photo page URLs to direct image URLs
        if (imageUrl.includes('unsplash.com/photos/')) {
          const photoId = imageUrl.split('/photos/')[1]?.split('/')[0]?.split('?')[0];
          if (photoId) {
            imageUrl = `https://source.unsplash.com/${photoId}/800x600`;
          }
        }
        
        return imageUrl;
      }).filter((url: string) => url && url.trim() !== '') || [];
      
      return {
        id: villa._id.toString(),
        _id: villa._id.toString(), // For admin compatibility
        name: villa.name,
        description: villa.description,
        price: villa.price,
        location: villa.location,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        maxGuests: villa.maxGuests,
        images: images,
        features: villa.features || [],
        amenities: villa.amenities || [],
        isActive: villa.isActive,
        isPublished: villa.isPublished,
        createdAt: villa.createdAt,
        updatedAt: villa.updatedAt
      };
    });

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
