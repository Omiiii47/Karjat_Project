import { NextRequest, NextResponse } from 'next/server';
import getAdminUserModel from '@/models/AdminUser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const AdminUser = await getAdminUserModel();

    // Build query
    const query: any = {};
    if (role) {
      query.role = role;
    }
    if (status === 'active') {
      query.isActive = true;
      query.isBanned = false;
    } else if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await AdminUser.countDocuments(query);

    // Get users with pagination
    const users = await AdminUser.find(query)
      .select('-password -passwordResetToken -emailVerificationToken') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      role,
      address,
      dateOfBirth,
      gender,
      preferences,
      adminNotes,
      tags
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const AdminUser = await getAdminUserModel();

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user in admin database
    const user = new AdminUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      role: role || 'user',
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      preferences,
      adminNotes,
      tags: tags || [],
      isActive: true,
      isEmailVerified: true, // Admin created users are auto-verified
      loginCount: 0
    });

    const savedUser = await user.save();

    // Remove sensitive fields from response
    const { password, passwordResetToken, emailVerificationToken, ...userResponse } = savedUser.toObject();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
