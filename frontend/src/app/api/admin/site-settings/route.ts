import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { SiteSettings } from '@/models/SiteSettings';

export async function GET() {
  try {
    await connectDB();
    
    // Get the active site settings (there should only be one)
    let settings = await SiteSettings.findOne({ isActive: true });
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = new SiteSettings({
        siteName: 'Solscape Villas',
        tagline: 'Luxury Villa Rentals in Paradise',
        description: 'Experience the ultimate luxury vacation rental experience',
        contactEmail: 'info@solscape.com',
        contactPhone: '+1 (555) 123-4567',
        address: 'Karjat, Maharashtra, India',
        heroImages: [],
        aboutText: 'Welcome to Solscape Villas, where luxury meets comfort.',
        features: [],
        socialMedia: {},
        seoSettings: {
          metaTitle: 'Solscape Villas - Luxury Villa Rentals',
          metaDescription: 'Book luxury villa rentals for your perfect vacation',
          keywords: ['villa', 'rental', 'luxury', 'vacation', 'karjat']
        },
        isActive: true
      });
      await settings.save();
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    await connectDB();
    
    // Update or create site settings
    let settings = await SiteSettings.findOne({ isActive: true });
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, body);
      settings.updatedAt = new Date();
      await settings.save();
    } else {
      // Create new settings
      settings = new SiteSettings({
        ...body,
        isActive: true
      });
      await settings.save();
    }

    return NextResponse.json({
      message: 'Site settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Error updating site settings:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid settings data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
