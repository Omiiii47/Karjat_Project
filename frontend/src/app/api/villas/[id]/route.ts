import { NextRequest, NextResponse } from 'next/server';
import getAdminVillaModel from '@/models/AdminVilla';
import { connectAdminDB } from '@/lib/admin-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/villas/[id] - Villa ID:', params.id);
    
    // Establish connection and wait for it to be ready
    const connection = await connectAdminDB();
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }
    
    const AdminVilla = await getAdminVillaModel();
    
    const villa = await AdminVilla.findById(params.id).lean();
    
    if (!villa || !(villa as any).isActive || !(villa as any).isPublished) {
      console.log('Villa not found or not active/published');
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    console.log('Raw villa images:', (villa as any).images);

    // Transform data for frontend consumption
    const transformedVilla = {
      id: (villa as any)._id.toString(),
      name: (villa as any).name,
      description: (villa as any).description,
      price: (villa as any).price,
      location: (villa as any).location,
      bedrooms: (villa as any).bedrooms,
      bathrooms: (villa as any).bathrooms,
      maxGuests: (villa as any).maxGuests,
      images: (villa as any).images?.map((img: any) => {
        let imageUrl = img.url || img;
        
        // Convert Unsplash photo page URLs to direct image URLs
        if (imageUrl.includes('unsplash.com/photos/')) {
          const photoId = imageUrl.split('/photos/')[1]?.split('/')[0]?.split('?')[0];
          if (photoId) {
            imageUrl = `https://source.unsplash.com/${photoId}/800x600`;
          }
        }
        
        return imageUrl;
      }).filter((url: string) => url && url.trim() !== '') || [],
      features: (villa as any).features || [],
      amenities: (villa as any).amenities || []
    };

    console.log('Transformed villa images:', transformedVilla.images);

    return NextResponse.json(transformedVilla);

  } catch (error) {
    console.error('Error fetching villa details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch villa details' },
      { status: 500 }
    );
  }
}
