import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Get sales credentials from environment variables
    const salesEmail = process.env.SALES_EMAIL;
    const salesPassword = process.env.SALES_PASSWORD;

    // Validate environment variables are set
    if (!salesEmail || !salesPassword) {
      return NextResponse.json(
        { success: false, message: 'Sales credentials not configured' },
        { status: 500 }
      );
    }

    // Check credentials
    if (email !== salesEmail || password !== salesPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid sales credentials' },
        { status: 401 }
      );
    }

    // Create sales user object
    const salesUser = {
      _id: 'sales-user-id',
      firstName: 'Sales',
      lastName: 'Team',
      email: salesEmail,
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'sales' as const,
      isVerified: true,
      isEmailVerified: true,
    };

    // Generate JWT token
    const token = generateToken(salesUser);

    return NextResponse.json({
      success: true,
      message: 'Sales login successful',
      user: salesUser,
      token
    });

  } catch (error) {
    console.error('Sales login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
