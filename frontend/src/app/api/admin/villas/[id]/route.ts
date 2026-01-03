import { NextRequest, NextResponse } from 'next/server';
import getAdminVillaModel from '@/models/AdminVilla';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminVilla = await getAdminVillaModel();
    
    const villa = await AdminVilla.findById(params.id);
    
    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(villa);

  } catch (error) {
    console.error('Error fetching admin villa:', error);
    return NextResponse.json(
      { error: 'Failed to fetch villa' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Transform images array if it contains strings
    if (body.images && Array.isArray(body.images)) {
      body.images = body.images.map((item: any, index: number) => {
        // If it's already an object, keep it as is
        if (typeof item === 'object' && item.url) {
          return item;
        }
        // If it's a string, transform it to the expected object format
        return {
          url: typeof item === 'string' ? item.trim() : item,
          caption: '',
          isMain: index === 0,
          category: 'general'
        };
      });
    }
    
    const AdminVilla = await getAdminVillaModel();
    
    const villa = await AdminVilla.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date(), lastModifiedBy: 'admin' },
      { new: true, runValidators: true }
    );

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Villa updated successfully',
      villa
    });

  } catch (error) {
    console.error('Error updating admin villa:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid villa data provided: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update villa: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminVilla = await getAdminVillaModel();
    
    const villa = await AdminVilla.findByIdAndDelete(params.id);

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Villa deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin villa:', error);
    return NextResponse.json(
      { error: 'Failed to delete villa' },
      { status: 500 }
    );
  }
}
