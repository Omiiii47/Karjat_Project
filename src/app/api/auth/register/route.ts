import { NextRequest, NextResponse } from 'next/server';
import getAdminUserModel from '@/models/AdminUser';
import { hashPassword, generateToken } from '@/lib/auth';
import { CreateUserData, AuthResponse } from '@/types/user';
import { isValidEmail, isRealEmailDomain } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserData = await request.json();
    const { name, username, email, password, phone } = body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'All fields (name, username, email, password) are required' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' },
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

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const AdminUser = await getAdminUserModel();

    // Check if email already exists
    const existingEmail = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await AdminUser.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Username is already taken. Please choose another one.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await AdminUser.create({
      name,
      username: username.toLowerCase(), // Store in lowercase for consistency
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'user',
      isEmailVerified: true, // Set to true for now (can add email verification later)
      isActive: true,
      lastLogin: new Date(),
      loginCount: 1,
    });

    // Create response user (excluding password)
    const userResponse = {
      _id: newUser._id.toString(),
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone || '',
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      role: newUser.role,
      isEmailVerified: true,
    };

    // Generate JWT token for automatic login
    const token = generateToken(userResponse);

    console.log('User registered successfully:', username);

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
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
