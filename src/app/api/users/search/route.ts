import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/AdminUser';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({
        success: false,
        message: 'Search query is required'
      }, { status: 400 });
    }

    // Search by name, email, or phone
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    })
    .select('firstName lastName email phone')
    .limit(10);

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to search users'
    }, { status: 500 });
  }
}
