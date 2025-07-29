import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Villa from '@/models/Villa';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const villa = await Villa.findById(params.id);
    
    if (!villa) {
      return NextResponse.json(
        { error: 'Villa not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ villa });

  } catch (error) {
    console.error('Error fetching villa:', error);
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
    
    await connectDB();
    
    const villa = await Villa.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
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
    console.error('Error updating villa:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid villa data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update villa' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const villa = await Villa.findByIdAndDelete(params.id);

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
    console.error('Error deleting villa:', error);
    return NextResponse.json(
      { error: 'Failed to delete villa' },
      { status: 500 }
    );
  }
}
