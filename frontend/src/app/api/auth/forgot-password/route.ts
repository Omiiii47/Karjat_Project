import { NextRequest, NextResponse } from 'next/server';
import getAdminUserModel from '@/models/AdminUser';
import { generateResetToken } from '@/lib/auth';
import { sendPasswordResetEmail, isValidEmail } from '@/lib/email';
import { ForgotPasswordData } from '@/types/user';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordData = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const AdminUser = await getAdminUserModel();

    // Find user by email
    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration attacks
    // (Don't reveal if email exists or not)
    if (!user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        },
        { status: 200 }
      );
    }

    // Check if account is active
    if (!user.isActive || user.isBanned) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const { token, hashedToken, expiry } = generateResetToken();

    // Save hashed token to database
    await AdminUser.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expiry,
          updatedAt: new Date()
        }
      }
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, token, user.name);
      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Clear the reset token if email fails
      await AdminUser.updateOne(
        { _id: user._id },
        {
          $unset: {
            passwordResetToken: '',
            passwordResetExpires: ''
          }
        }
      );
      
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset link has been sent to your email. Please check your inbox.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
