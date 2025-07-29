import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { CreateUserData, AuthResponse } from '@/types/user';
import { isValidEmail, isRealEmailDomain } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserData = await request.json();
    const { firstName, lastName, email, password, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format and authenticity
    if (!isValidEmail(email)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!isRealEmailDomain(email)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Please use a real email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // For now, we'll skip email verification and create the user directly
    // You can add email verification later when you set up the email service
    const newUser = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'user' as const,
      isVerified: true, // Set to true for now
      isEmailVerified: true, // Set to true for now
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user into database
    const result = await users.insertOne(newUser);

    // Create response user (excluding password)
    const userResponse = {
      _id: result.insertedId.toString(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      role: 'user' as const,
      isVerified: true,
      isEmailVerified: true,
    };

    // Generate JWT token for automatic login
    const token = generateToken(userResponse);

    // Return success response with user data and token
    return NextResponse.json<AuthResponse>(
      { 
        success: true, 
        message: 'Registration successful! Welcome to Solscape!',
        user: userResponse,
        token
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
