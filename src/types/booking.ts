export interface Villa {
  id: string;
  name: string;
  location: string;
  images: string[];
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  description: string;
}

export interface Trip {
  id: string;
  villa: {
    id: string;
    name: string;
    location: string;
    images: string[];
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
}

export interface Booking {
  id: string;
  villaId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentStatus: 'pending' | 'completed' | 'failed';
  bookingStatus: 'confirmed' | 'cancelled';
  createdAt: string;
}
