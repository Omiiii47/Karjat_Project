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

export interface BookingFormData {
  villaId: string;
  villaName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfKids: number;
  numberOfPets: number;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  purposeOfVisit: string;
  otherPurpose?: string;
  specialRequests?: string;
  bookingType?: 'pay' | 'hold'; // Add booking type
}

export interface BookingData extends BookingFormData {
  _id: string;
  userId?: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingReference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingResponse {
  success: boolean;
  booking?: BookingData;
  message: string;
}

export interface BookingsListResponse {
  bookings: BookingData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
