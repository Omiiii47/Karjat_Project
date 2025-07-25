# Villa Booking Website

A modern, mobile-first villa booking website built with Next.js, TypeScript, Tailwind CSS, and Stripe integration.

## Features

- 🏖️ **Full-screen hero carousel** - Auto-sliding villa images on landing page
- 📱 **Mobile-first design** - Optimized for mobile devices with swipe gestures
- 🃏 **Tinder-style browsing** - Swipe through villas one at a time
- 💳 **Stripe integration** - Secure payment processing
- 🗄️ **MongoDB ready** - Database models and connection setup
- ⚡ **Performance optimized** - Image optimization and smooth animations

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Payments**: Stripe
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel-ready

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── booking/           # Booking success page
│   ├── villa/[id]/        # Individual villa pages
│   ├── villas/            # Villa listing page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── HeroCarousel.tsx   # Landing page carousel
│   ├── CenteredButton.tsx # Centered action button
│   ├── VillaCard.tsx      # Swipeable villa card
│   ├── SwipeDeck.tsx      # Villa browsing interface
│   ├── VillaGallery.tsx   # Image gallery for villa details
│   ├── VillaInfo.tsx      # Villa information display
│   ├── StripeCheckoutButton.tsx # Payment integration
│   └── Navbar.tsx         # Navigation component
├── lib/                   # External service configurations
│   ├── db.ts             # MongoDB connection
│   └── stripe.ts         # Stripe configuration
├── models/               # Database models
│   └── Villa.ts          # Villa schema
├── types/                # TypeScript type definitions
│   └── villa.ts          # Villa and booking types
└── utils/                # Utility functions
    └── helpers.ts        # Helper functions and sample data
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or cloud)
- Stripe account

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.local` and update with your values:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/villa-booking

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

   # Next.js
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Usage

### Landing Page (/)
- Full-screen carousel automatically slides every 3 seconds
- Click "Book Now" to browse villas

### Villa Browsing (/villas)
- Swipe right to skip to next villa
- Tap villa card to view details
- Tap "Book Now" for quick booking

### Villa Details (/villa/[id])
- Photo gallery with navigation
- Detailed villa information
- Booking form with Stripe integration

## Configuration

### Adding New Villas

Update `src/utils/helpers.ts` to add sample villas or connect to your database API.

### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Update environment variables
4. Test with Stripe's test card numbers

### Database Setup

The project includes MongoDB models. To use a real database:

1. Set up MongoDB (local or cloud)
2. Update `MONGODB_URI` in environment variables
3. Create API routes for CRUD operations

## Customization

### Styling
- Built with Tailwind CSS
- Customize colors in `tailwind.config.ts`
- Mobile-first responsive design

### Animations
- Using Framer Motion for smooth transitions
- Customize animations in component files

### Images
- Using Next.js Image component for optimization
- Replace sample Unsplash images with your villa photos

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Node.js.

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Features

The modular architecture makes it easy to add new features:

1. Create new components in `src/components/`
2. Add new pages in `src/app/`
3. Update types in `src/types/`
4. Add utilities in `src/utils/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
