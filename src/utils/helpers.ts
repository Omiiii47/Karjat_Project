import { Villa } from '@/types/villa';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateString = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatPriceINR = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const calculateTotalPrice = (pricePerNight: number, nights: number): number => {
  return pricePerNight * nights;
};

// Sample villa data for development
export const sampleVillas: Villa[] = [
  {
    id: '1',
    name: 'Luxury Beach Villa',
    description: 'A stunning beachfront villa with panoramic ocean views and private beach access.',
    price: 450,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
    ],
    features: ['Ocean View', 'Private Beach', 'Pool', 'Garden'],
    location: 'Malibu, California',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Hot Tub', 'BBQ Grill']
  },
  {
    id: '2',
    name: 'Mountain Retreat',
    description: 'Cozy mountain villa nestled in the hills with breathtaking valley views.',
    price: 320,
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop'
    ],
    features: ['Mountain View', 'Fireplace', 'Deck', 'Forest Access'],
    location: 'Aspen, Colorado',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Fireplace', 'Hiking Trails']
  },
  {
    id: '3',
    name: 'Modern City Villa',
    description: 'Contemporary villa in the heart of the city with rooftop terrace.',
    price: 380,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&h=600&fit=crop'
    ],
    features: ['City View', 'Rooftop Terrace', 'Modern Design', 'Central Location'],
    location: 'Downtown Los Angeles',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    amenities: ['WiFi', 'Kitchen', 'Gym Access', 'Rooftop Pool', 'Concierge']
  },
  {
    id: '4',
    name: 'Tropical Paradise Villa',
    description: 'Exotic villa surrounded by lush tropical gardens with infinity pool overlooking the ocean.',
    price: 550,
    images: [
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
    ],
    features: ['Ocean View', 'Infinity Pool', 'Tropical Garden', 'Private Chef Available'],
    location: 'Maui, Hawaii',
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    amenities: ['WiFi', 'Kitchen', 'Pool Service', 'Spa', 'Private Beach Access', 'Concierge']
  }
];
