import { NextRequest, NextResponse } from 'next/server';
import getAdminContactModel from '@/models/AdminContact';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminContact = await getAdminContactModel();
    
    const contact = await AdminContact.findById(params.id);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);

  } catch (error) {
    console.error('Error fetching admin contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
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
    
    const AdminContact = await getAdminContactModel();
    
    // Handle status updates
    const updateData = { ...body, updatedAt: new Date() };
    
    if (body.status === 'resolved' && !body.resolvedDate) {
      updateData.resolvedDate = new Date();
    }
    
    if (body.adminResponse && !body.responseDate) {
      updateData.responseDate = new Date();
    }
    
    // Add to communication history if there's a new message
    if (body.adminResponse && body.adminResponse !== '') {
      updateData.$push = {
        communicationHistory: {
          date: new Date(),
          type: 'internal-note',
          message: body.adminResponse,
          sentBy: 'admin'
        }
      };
    }
    
    const contact = await AdminContact.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Contact updated successfully',
      contact
    });

  } catch (error) {
    console.error('Error updating admin contact:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid contact data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const AdminContact = await getAdminContactModel();
    
    const contact = await AdminContact.findByIdAndDelete(params.id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
