export interface Villa {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  features: string[];
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
}

export interface BookingData {
  villaId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  customerEmail: string;
  customerName: string;
}
