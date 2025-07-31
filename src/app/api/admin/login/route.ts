import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate environment variables are set
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Admin credentials not configured' },
        { status: 500 }
      );
    }

    // Check credentials
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Create admin user object
    const adminUser = {
      _id: 'admin-user-id',
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin' as const,
      isVerified: true,
      isEmailVerified: true,
    };

    // Generate JWT token
    const token = generateToken(adminUser);

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      user: adminUser,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
