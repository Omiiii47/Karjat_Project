import { NextRequest, NextResponse } from 'next/server';
import getAdminContactModel from '@/models/AdminContact';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const inquiryType = searchParams.get('inquiryType');
    const search = searchParams.get('search');

    const AdminContact = await getAdminContactModel();

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (inquiryType) {
      query.inquiryType = inquiryType;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await AdminContact.countDocuments(query);

    // Get contacts with pagination
    const contacts = await AdminContact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      name,
      email,
      phone,
      subject,
      message,
      inquiryType,
      relatedVillaId,
      relatedVillaName,
      priority,
      userAgent,
      ipAddress,
      referrerUrl
    } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const AdminContact = await getAdminContactModel();

    // Create new contact in admin database
    const contact = new AdminContact({
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      subject,
      message,
      inquiryType: inquiryType || 'general',
      relatedVillaId,
      relatedVillaName,
      status: 'new',
      priority: priority || 'medium',
      userAgent,
      ipAddress,
      referrerUrl,
      followUpRequired: false
    });

    const savedContact = await contact.save();

    return NextResponse.json(
      {
        message: 'Contact inquiry created successfully',
        contact: savedContact
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating admin contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact inquiry' },
      { status: 500 }
    );
  }
}
