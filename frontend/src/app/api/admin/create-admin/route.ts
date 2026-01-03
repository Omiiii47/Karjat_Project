import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { CreateUserData, AuthResponse } from '@/types/user';

// SECURITY NOTE: This is a temporary admin creation endpoint
// In production, remove this or add additional security measures

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

    // Create admin user
    const newAdmin = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'admin' as const, // Set role to admin
      isVerified: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert admin into database
    const result = await users.insertOne(newAdmin);

    // Create response user (excluding password)
    const userResponse = {
      _id: result.insertedId.toString(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      createdAt: newAdmin.createdAt,
      updatedAt: newAdmin.updatedAt,
      role: 'admin' as const,
      isVerified: true,
      isEmailVerified: true,
    };

    // Generate JWT token for automatic login
    const token = generateToken(userResponse);

    // Return success response with user data and token
    return NextResponse.json<AuthResponse>(
      { 
        success: true, 
        message: 'Admin account created successfully!',
        user: userResponse,
        token
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
