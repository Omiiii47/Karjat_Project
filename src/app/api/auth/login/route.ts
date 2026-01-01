import { NextRequest, NextResponse } from 'next/server';
import getAdminUserModel from '@/models/AdminUser';
import { verifyPassword, generateToken } from '@/lib/auth';
import { LoginData, AuthResponse } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const AdminUser = await getAdminUserModel();

    // Find user by email
    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password (some might use social login only)
    if (!user.password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Please use social login or reset your password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: `Your account has been banned. Reason: ${user.banReason || 'Violation of terms'}` },
        { status: 403 }
      );
    }

    // Update last login
    await AdminUser.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        },
        $inc: { loginCount: 1 }
      }
    );

    // Create user object without password for response
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      createdAt: user.createdAt,
      updatedAt: new Date(),
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    // Generate JWT token
    const token = generateToken(userResponse);

    console.log('User logged in successfully:', user.username);

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Login successful',
        user: userResponse,
        token
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
