import { NextRequest, NextResponse } from 'next/server';
import getAdminUserModel from '@/models/AdminUser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const field = searchParams.get('field') || 'all'; // all, username, email, phone

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const AdminUser = await getAdminUserModel();

    // Build search criteria
    let searchCriteria: any = { isActive: true }; // Only search active users

    if (field === 'username') {
      searchCriteria.username = { $regex: query, $options: 'i' };
    } else if (field === 'email') {
      searchCriteria.email = { $regex: query, $options: 'i' };
    } else if (field === 'phone') {
      searchCriteria.phone = { $regex: query, $options: 'i' };
    } else {
      // Search across all fields
      searchCriteria.$or = [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ];
    }

    // Find users (limit to 20 results)
    const users = await AdminUser
      .find(searchCriteria)
      .select('_id username name email phone createdAt lastLogin')
      .limit(20)
      .sort({ lastLogin: -1 }); // Most recent first

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users: users.map((user: any) => ({
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }))
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user by username (for /call team dashboard)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    const AdminUser = await getAdminUserModel();

    const user = await AdminUser
      .findOne({ username: username.toLowerCase() })
      .select('_id username name email phone createdAt lastLogin isActive');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
