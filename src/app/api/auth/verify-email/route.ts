import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import { AuthResponse } from '@/types/user';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Find user with this verification token
    const user = await users.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: {
          emailVerificationToken: '',
          emailVerificationExpires: ''
        }
      }
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Create response user (excluding password)
    const userResponse = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      createdAt: user.createdAt,
      updatedAt: new Date(),
      role: user.role,
      isVerified: true,
      isEmailVerified: true,
    };

    // Generate JWT token for automatic login
    const jwtToken = generateToken(userResponse);

    return NextResponse.json<AuthResponse>(
      { 
        success: true, 
        message: 'Email verified successfully! You are now logged in.',
        user: userResponse,
        token: jwtToken
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
