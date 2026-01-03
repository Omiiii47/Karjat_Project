import { NextResponse } from 'next/server';
import { connectAdminDB } from '@/lib/admin-db';
import getAdminUserModel from '@/models/AdminUser';

export async function GET() {
  try {
    await connectAdminDB();
    const AdminUser = await getAdminUserModel();
    
    // Fetch all users, excluding password
    const users = await AdminUser.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
