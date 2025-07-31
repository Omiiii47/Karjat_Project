import { NextRequest, NextResponse } from 'next/server';
import getAdminVillaModel from '@/models/AdminVilla';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminVilla = await getAdminVillaModel();
    
    const villa = await AdminVilla.findById(params.id).lean();
    
    if (!villa || !(villa as any).isActive || !(villa as any).isPublished) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

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
      images: (villa as any).images?.map((img: any) => img.url || img).filter((url: string) => url && url.trim() !== '') || [],
      features: (villa as any).features || [],
      amenities: (villa as any).amenities || []
    };

    return NextResponse.json(transformedVilla);

  } catch (error) {
    console.error('Error fetching villa details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch villa details' },
      { status: 500 }
    );
  }
}
