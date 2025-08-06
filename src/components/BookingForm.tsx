'use client';

import { useState, useEffect } from 'react';
import { BookingFormData } from '@/types/booking';
import { useAuth } from '@/contexts/AuthContext';
import DatePickerCalendar from './DatePickerCalendar';

interface BookingFormProps {
  villaId: string;
  villaName: string;
  pricePerNight: number;
  maxGuests: number;
}

export default function BookingForm({ villaId, villaName, pricePerNight, maxGuests }: BookingFormProps) {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    guestName: user ? `${user.firstName} ${user.lastName}` : '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [error, setError] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
    conflictingBookings?: any[];
  }>({
    checking: false,
    available: null,
    message: ''
  });
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  // Fetch booked dates when component mounts
  useEffect(() => {
    fetchBookedDates();
  }, [villaId]);

  // Check availability when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      checkAvailability();
    } else {
      setAvailabilityStatus({
        checking: false,
        available: null,
        message: ''
      });
    }
  }, [formData.checkInDate, formData.checkOutDate, villaId]);

  const fetchBookedDates = async () => {
    try {
      const response = await fetch(`/api/villa/availability?villaId=${villaId}&months=6`);
      const data = await response.json();
      
      if (data.success) {
        setBookedDates(data.bookedDates);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const checkAvailability = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) return;

    setAvailabilityStatus({
      checking: true,
      available: null,
      message: 'Checking availability...'
    });

    try {
      const response = await fetch('/api/villa/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          villaId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate
        })
      });

      const data = await response.json();
      
      setAvailabilityStatus({
        checking: false,
        available: data.available,
        message: data.message,
        conflictingBookings: data.conflictingBookings
      });

    } catch (error) {
      setAvailabilityStatus({
        checking: false,
        available: null,
        message: 'Error checking availability'
      });
    }
  };

  // Calculate nights and total amount
  const calculateBookingDetails = () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      return { numberOfNights: 0, totalAmount: 0 };
    }
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount = numberOfNights * pricePerNight;
    
    return { numberOfNights: Math.max(0, numberOfNights), totalAmount };
  };

  const { numberOfNights, totalAmount } = calculateBookingDetails();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) : value
    }));
  };

  const handleCalendarDateSelect = (checkIn: string, checkOut: string) => {
    setFormData(prev => ({
      ...prev,
      checkInDate: checkIn,
      checkOutDate: checkOut
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const bookingData: BookingFormData = {
        villaId,
        villaName,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: formData.numberOfGuests,
        numberOfNights,
        pricePerNight,
        totalAmount,
        specialRequests: formData.specialRequests || undefined
      };

      // Add debugging
      console.log('=== BOOKING FORM DEBUG ===');
      console.log('Villa ID from props:', villaId);
      console.log('Villa Name from props:', villaName);
      console.log('Price per night:', pricePerNight);
      console.log('Max guests:', maxGuests);
      console.log('Booking data being sent:', JSON.stringify(bookingData, null, 2));

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create booking');
      }

      setBookingSuccess(true);
      setBookingReference(result.booking.bookingReference);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Booking Confirmed!</h3>
          <p className="text-green-700 mb-4">
            Your booking has been successfully created.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-lg font-mono font-bold text-gray-900">{bookingReference}</p>
          </div>
          <p className="text-sm text-green-600">
            We'll contact you shortly to confirm your booking details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* User Status */}
      {user ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-900 font-medium">Booking as: {user.firstName} {user.lastName}</p>
              <p className="text-blue-700 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-yellow-900 font-medium">Guest Booking</p>
              <p className="text-yellow-700 text-sm">
                <a href="/login" className="underline hover:text-yellow-800">Sign in</a> to track your bookings
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Guest Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="guestName"
          value={formData.guestName}
          onChange={handleInputChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          name="guestEmail"
          value={formData.guestEmail}
          onChange={handleInputChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          name="guestPhone"
          value={formData.guestPhone}
          onChange={handleInputChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          placeholder="Enter your phone number"
        />
      </div>

      {/* Date Selection Calendar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Check-in and Check-out Dates *
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Click to select your check-in date first, then click to select your check-out date
        </p>
        <DatePickerCalendar
          villaId={villaId}
          onDateSelect={handleCalendarDateSelect}
          bookedDates={bookedDates}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Guests *
        </label>
        <select 
          name="numberOfGuests"
          value={formData.numberOfGuests}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
        >
          {Array.from({ length: Math.min(maxGuests, 20) }, (_, i) => (
            <option key={i + 1} value={i + 1} className="text-black">
              {i + 1} Guest{i + 1 > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white resize-none"
          placeholder="Any special requests or requirements..."
        />
      </div>

      {/* Booking Summary */}
      {numberOfNights > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Price per night:</span>
              <span>₹{pricePerNight.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Number of nights:</span>
              <span>{numberOfNights}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Number of guests:</span>
              <span>{formData.numberOfGuests}</span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting || numberOfNights <= 0 || availabilityStatus.available === false || availabilityStatus.checking}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating Booking...
          </div>
        ) : availabilityStatus.checking ? (
          'Checking Availability...'
        ) : availabilityStatus.available === false ? (
          'Not Available for Selected Dates'
        ) : (
          `Book for ₹${totalAmount.toLocaleString()}`
        )}
      </button>
    </form>
  );
}
