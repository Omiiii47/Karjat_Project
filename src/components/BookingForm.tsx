'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingFormData } from '@/types/booking';
import { useAuth } from '@/contexts/AuthContext';
import DatePickerCalendar from './DatePickerCalendar';

interface BookingFormProps {
  villaId: string;
  villaName: string;
  pricePerNight: number;
  maxGuests: number;
  paymentOnly?: boolean;
  customOffer?: boolean;
  customOfferDetails?: any;
  existingBookingRequestId?: string;
}

export default function BookingForm({ 
  villaId, 
  villaName, 
  pricePerNight, 
  maxGuests, 
  paymentOnly = false, 
  customOffer = false,
  customOfferDetails = null,
  existingBookingRequestId 
}: BookingFormProps) {
  const { token, user } = useAuth();

  const getDisplayName = () => {
    const nameFromUser = (user as any)?.name;
    const firstLast = [
      (user as any)?.firstName,
      (user as any)?.lastName
    ].filter(Boolean).join(' ');
    return nameFromUser || firstLast || (user as any)?.username || user?.email || '';
  };

  const [formData, setFormData] = useState({
    guestName: user ? getDisplayName() : '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    numberOfAdults: 1,
    numberOfKids: 0,
    numberOfPets: 0,
    purposeOfVisit: '',
    otherPurpose: '',
    specialRequests: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [informationConfirmed, setInformationConfirmed] = useState(false);
  const [bookingRequestId, setBookingRequestId] = useState<string | null>(null);
  const [salesResponseStatus, setSalesResponseStatus] = useState<'pending' | 'accepted' | 'declined' | 'custom-offer' | null>(null);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
  const [bookedDates, setBookedDates] = useState<Array<{date: string; status: 'confirmed' | 'pending'}>>([]);

  // Ensure guest name is never shown as "undefined undefined"
  useEffect(() => {
    if (!user) return;
    const displayName = getDisplayName();
    if (!displayName) return;

    setFormData(prev => {
      const current = (prev.guestName || '').trim();
      if (!current || current.toLowerCase() === 'undefined undefined') {
        return { ...prev, guestName: displayName };
      }
      return prev;
    });
  }, [user]);

  // Fetch booked dates when component mounts
  useEffect(() => {
    fetchBookedDates();
  }, [villaId]);

  // Load existing booking for payment-only mode
  useEffect(() => {
    if (paymentOnly && existingBookingRequestId) {
      loadExistingBooking(existingBookingRequestId);
    }
  }, [paymentOnly, existingBookingRequestId]);

  // Load custom offer details and pre-fill form
  useEffect(() => {
    if (customOffer && customOfferDetails) {
      setFormData({
        guestName: customOfferDetails.guestName,
        guestEmail: customOfferDetails.guestEmail,
        guestPhone: customOfferDetails.guestPhone,
        checkInDate: customOfferDetails.checkInDate,
        checkOutDate: customOfferDetails.checkOutDate,
        numberOfGuests: customOfferDetails.numberOfGuests,
        numberOfAdults: customOfferDetails.numberOfAdults,
        numberOfKids: customOfferDetails.numberOfKids,
        numberOfPets: customOfferDetails.numberOfPets,
        purposeOfVisit: customOfferDetails.purposeOfVisit,
        otherPurpose: customOfferDetails.otherPurpose || '',
        specialRequests: customOfferDetails.specialRequests || ''
      });
      setBookingRequestId(existingBookingRequestId || null);
      setTermsAccepted(true);
      setInformationConfirmed(true);
      setSalesResponseStatus('custom-offer');
    }
  }, [customOffer, customOfferDetails, existingBookingRequestId]);

  const loadExistingBooking = async (requestId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/booking/request/${requestId}`);
      const data = await response.json();
      
      if (data.success && data.bookingRequest) {
        const booking = data.bookingRequest;
        setFormData({
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          numberOfGuests: booking.numberOfGuests,
          numberOfAdults: booking.numberOfAdults,
          numberOfKids: booking.numberOfKids,
          numberOfPets: booking.numberOfPets,
          purposeOfVisit: booking.purposeOfVisit,
          otherPurpose: booking.otherPurpose || '',
          specialRequests: booking.specialRequests || ''
        });
        setBookingRequestId(requestId);
        setTermsAccepted(true);
        setSalesResponseStatus('accepted');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    }
  };

  // No localStorage persistence for bookings/requests (DB is source of truth)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Check availability when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      checkAvailability();
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  const fetchBookedDates = async () => {
    try {
      const response = await fetch(`/api/villas/${villaId}/booked-dates`);
      if (response.ok) {
        const data = await response.json();
        setBookedDates(data.bookedDates || []);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      setBookedDates([]);
    }
  };

  const checkAvailability = async () => {
    setAvailabilityStatus(prev => ({ ...prev, checking: true, message: 'Checking availability...' }));

    try {
      const response = await fetch('/api/booking/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    const numericFields = ['numberOfGuests', 'numberOfAdults', 'numberOfKids', 'numberOfPets'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) : value
    }));
  };

  const handleCalendarDateSelect = (checkIn: string, checkOut: string) => {
    setFormData(prev => ({
      ...prev,
      checkInDate: checkIn,
      checkOutDate: checkOut
    }));
  };

  const canAcceptTerms = informationConfirmed && 
    formData.checkInDate && 
    formData.checkOutDate && 
    formData.guestPhone.trim() !== '' &&
    formData.purposeOfVisit !== '' &&
    (formData.purposeOfVisit !== 'others' || formData.otherPurpose.trim() !== '');

  const handleAcceptTermsAndProceed = async () => {
    if (!canAcceptTerms) return;
    
    setIsAwaitingResponse(true);
    setError('');
    
    try {
      // Submit booking request to sales team
      const bookingRequestData = {
        villaId,
        villaName,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: formData.numberOfAdults + formData.numberOfKids,
        numberOfAdults: formData.numberOfAdults,
        numberOfKids: formData.numberOfKids,
        numberOfPets: formData.numberOfPets,
        purposeOfVisit: formData.purposeOfVisit,
        otherPurpose: formData.otherPurpose,
        numberOfNights,
        pricePerNight,
        totalAmount,
        specialRequests: formData.specialRequests,
        ...(token && user?._id && { userId: user._id })
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/booking/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(bookingRequestData)
      });

      const data = await response.json();

      if (data.success) {
        setBookingRequestId(data.bookingRequestId);
        // Start polling for sales response
        startPollingForResponse(data.bookingRequestId);
      } else {
        setError(data.message || 'Failed to submit booking request');
        setIsAwaitingResponse(false);
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      setError('Failed to submit booking request. Please try again.');
      setIsAwaitingResponse(false);
    }
  };

  const startPollingForResponse = (requestId: string) => {
    console.log('Starting to poll for booking request:', requestId);
    
    // Clear any existing intervals
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let pollCount = 0;
    const maxPollCount = 360; // 360 * 5 seconds = 30 minutes

    const doPoll = async () => {
      try {
        setLastPollTime(new Date());
        console.log('Polling for response... (attempt', pollCount + 1, ')');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/booking/request/${requestId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error('Poll response not OK:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Poll response:', data);

        if (data.success && data.status !== 'pending') {
          console.log('Status changed to:', data.status);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          // Don't clear localStorage here - keep it until payment is complete
          // localStorage.removeItem(`bookingRequest_${villaId}`);
          
          setSalesResponseStatus(data.status);
          setIsAwaitingResponse(false);
          
          if (data.status === 'accepted') {
            setTermsAccepted(true);
          }
        }
        
        pollCount++;
        if (pollCount >= maxPollCount) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setError('Request timeout. Please contact us directly.');
          setIsAwaitingResponse(false);
        }
      } catch (error) {
        console.error('Error polling for response:', error);
        // Don't stop polling on error, just log it
      }
    };

    // Do first poll immediately
    doPoll();
    
    // Then poll every 5 seconds
    pollIntervalRef.current = setInterval(doPoll, 5000);
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Use custom offer amount if available, otherwise use calculated total
      const finalAmount = customOffer && customOfferDetails?.customOffer?.adjustedTotalAmount 
        ? customOfferDetails.customOffer.adjustedTotalAmount 
        : totalAmount;

      // Use custom offer dates and nights if available
      const finalCheckInDate = customOffer && customOfferDetails?.checkInDate 
        ? customOfferDetails.checkInDate 
        : formData.checkInDate;
      const finalCheckOutDate = customOffer && customOfferDetails?.checkOutDate 
        ? customOfferDetails.checkOutDate 
        : formData.checkOutDate;
      const finalNumberOfNights = customOffer && customOfferDetails?.numberOfNights 
        ? customOfferDetails.numberOfNights 
        : numberOfNights;

      // Create booking with auto-payment
      const bookingData = {
        villaId,
        villaName,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        numberOfGuests: formData.numberOfAdults + formData.numberOfKids,
        numberOfAdults: formData.numberOfAdults,
        numberOfKids: formData.numberOfKids,
        numberOfPets: formData.numberOfPets,
        purposeOfVisit: formData.purposeOfVisit,
        otherPurpose: formData.otherPurpose,
        numberOfNights: finalNumberOfNights,
        pricePerNight: customOffer && customOfferDetails?.customOffer?.adjustedPricePerNight 
          ? customOfferDetails.customOffer.adjustedPricePerNight 
          : pricePerNight,
        totalAmount: finalAmount,
        specialRequests: formData.specialRequests,
        bookingType: 'pay', // This tells the API to mark as paid and confirmed
        bookingRequestId: existingBookingRequestId || bookingRequestId || undefined,
        ...(token && user?._id && { userId: user._id })
      };

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success
        setBookingRequestId(data.booking._id || data.booking.bookingId);
        setBookingReference(data.booking.bookingReference || data.booking.bookingId);
        setBookingSuccess(true);
        
        // Refresh booked dates for calendar
        fetchBookedDates();
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="w-16 h-16 bg-green-500/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-green-400/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.svg 
              className="w-8 h-8 text-green-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>
          <motion.h3 
            className="text-xl font-bold text-white mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Booking Confirmed & Paid!
          </motion.h3>
          <motion.p 
            className="text-white/80 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your booking has been confirmed and payment is complete. You can view this booking in your trips.
          </motion.p>
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-white/70 mb-1">Booking Reference</p>
            <p className="text-lg font-mono font-bold text-white">{bookingReference}</p>
          </motion.div>
          <motion.p 
            className="text-sm text-white/70 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            A confirmation email has been sent to {formData.guestEmail}
          </motion.p>
          {user && (
            <motion.a
              href="/trips"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Trips
            </motion.a>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Status */}
      {user ? (
        <motion.div 
          className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center mr-3 border border-blue-400/30"
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
            <div>
              <p className="text-white font-medium">Booking as: {getDisplayName()}</p>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="bg-amber-500/20 backdrop-blur-md border border-amber-400/30 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 bg-amber-500/30 rounded-full flex items-center justify-center mr-3 border border-amber-400/30"
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </motion.div>
            <div>
              <p className="text-amber-300 font-medium">Guest Booking</p>
              <p className="text-amber-200/70 text-sm">
                <a href="/login" className="underline hover:text-amber-100">Sign in</a> to track your bookings
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom Offer Pre-filled Information Display */}
      {customOffer && customOfferDetails && (
        <motion.div 
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center mb-4">
            <motion.div 
              className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center mr-3 border border-yellow-400/30"
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </motion.div>
            <div>
              <p className="text-yellow-300 font-bold text-lg">🎁 Special Offer Applied!</p>
              <p className="text-yellow-200/70 text-sm">Your booking details are confirmed below</p>
            </div>
          </div>

          <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Check-in</p>
                <p className="text-white font-medium">{new Date(formData.checkInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Check-out</p>
                <p className="text-white font-medium">{new Date(formData.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-3">
              <p className="text-white/60 text-xs mb-1">Contact</p>
              <p className="text-white font-medium">{formData.guestPhone}</p>
            </div>

            <div className="border-t border-white/20 pt-3">
              <p className="text-white/60 text-xs mb-1">Guests (as confirmed by sales team)</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="text-white/60 text-xs">Adults</p>
                  <p className="text-white font-bold text-lg">{formData.numberOfAdults}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="text-white/60 text-xs">Kids</p>
                  <p className="text-white font-bold text-lg">{formData.numberOfKids}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="text-white/60 text-xs">Pets</p>
                  <p className="text-white font-bold text-lg">{formData.numberOfPets}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-3">
              <p className="text-white/60 text-xs mb-1">Purpose of Visit</p>
              <p className="text-white font-medium capitalize">
                {formData.purposeOfVisit === 'others' ? formData.otherPurpose : formData.purposeOfVisit.replace(/-/g, ' ')}
              </p>
            </div>

            {customOfferDetails.customOffer && (
              <>
                <div className="border-t border-yellow-500/30 pt-3 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm">Original Price:</span>
                    <span className="text-white/50 line-through">₹{customOfferDetails.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm">Special Offer Price:</span>
                    <span className="text-green-300 font-bold text-xl">₹{customOfferDetails.customOffer.adjustedTotalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-300 text-sm font-semibold">You Save:</span>
                    <span className="text-yellow-300 font-bold">₹{customOfferDetails.customOffer.discountAmount.toLocaleString()} ({customOfferDetails.customOffer.discountPercentage.toFixed(1)}% OFF)</span>
                  </div>
                </div>

                {customOfferDetails.customOffer.salesNotes && (
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <p className="text-white/60 text-xs mb-1">Message from Sales Team:</p>
                    <p className="text-white/90 text-sm italic">"{customOfferDetails.customOffer.salesNotes}"</p>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-yellow-200/80 text-xs mt-4 text-center">
            ℹ️ These details are pre-filled based on your discussion with our sales team and cannot be changed.
          </p>
        </motion.div>
      )}

      {/* Guest Name */}
      {!paymentOnly && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-white/90 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="guestName"
          value={formData.guestName}
          onChange={handleInputChange}
          required
          className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
          placeholder="Enter your full name"
        />
      </motion.div>
      )}

      {/* Guest Email */}
      {!paymentOnly && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <label className="block text-sm font-medium text-white/90 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          name="guestEmail"
          value={formData.guestEmail}
          onChange={handleInputChange}
          required
          className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
          placeholder="Enter your email address"
        />
      </motion.div>
      )}

      {/* Guest Phone */}
      {!paymentOnly && !customOffer && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-white/90 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          name="guestPhone"
          value={formData.guestPhone}
          onChange={handleInputChange}
          required
          className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
          placeholder="Enter your phone number"
        />
      </motion.div>
      )}

      {/* Date Selection Calendar */}
      {!paymentOnly && !customOffer && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-sm font-medium text-white/90 mb-2">
          Select Your Check-in and Check-out Dates *
        </label>
        <p className="text-xs text-white/60 mb-4">
          Click to select your check-in date first, then click to select your check-out date
        </p>
        <DatePickerCalendar
          villaId={villaId}
          onDateSelect={handleCalendarDateSelect}
          bookedDates={bookedDates}
        />
      </motion.div>
      )}

      {/* Terms and Conditions Section */}
      {!paymentOnly && !termsAccepted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Confirmation</h3>
          
          {/* Number of Adults */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Number of Adults *
            </label>
            <select
              name="numberOfAdults"
              value={formData.numberOfAdults}
              onChange={handleInputChange}
              disabled={customOffer}
              className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {Array.from({ length: Math.min(maxGuests, 20) }, (_, i) => (
                <option key={i + 1} value={i + 1} className="text-black bg-white">
                  {i + 1} Adult{i + 1 > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Kids */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Number of Kids *
            </label>
            <select
              name="numberOfKids"
              value={formData.numberOfKids}
              onChange={handleInputChange}
              disabled={customOffer}
              className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i} value={i} className="text-black bg-white">
                  {i} Kid{i !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Pets */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Number of Pets *
            </label>
            <select
              name="numberOfPets"
              value={formData.numberOfPets}
              onChange={handleInputChange}
              disabled={customOffer}
              className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <option key={i} value={i} className="text-black bg-white">
                  {i} Pet{i !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Total Guests Display */}
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-xl p-3">
            <p className="text-sm text-blue-200">
              <strong>Total Guests:</strong> {formData.numberOfAdults + formData.numberOfKids} 
              {formData.numberOfPets > 0 && ` (+ ${formData.numberOfPets} pet${formData.numberOfPets !== 1 ? 's' : ''})`}
            </p>
          </div>

          {/* Purpose of Visit */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Purpose of Visit *
            </label>
            <select
              name="purposeOfVisit"
              value={formData.purposeOfVisit}
              onChange={handleInputChange}
              disabled={customOffer}
              className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" className="text-black bg-white">Select purpose</option>
              <option value="vacation" className="text-black bg-white">Vacation/Leisure</option>
              <option value="celebration" className="text-black bg-white">Celebration/Event</option>
              <option value="business" className="text-black bg-white">Business/Work</option>
              <option value="family" className="text-black bg-white">Family Gathering</option>
              <option value="others" className="text-black bg-white">Others</option>
            </select>
          </div>

          {/* Other Purpose Text Input */}
          {formData.purposeOfVisit === 'others' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-white/90 mb-2">
                Please specify your purpose *
              </label>
              <input
                type="text"
                name="otherPurpose"
                value={formData.otherPurpose}
                onChange={handleInputChange}
                disabled={customOffer}
                placeholder="Enter your purpose of visit"
                className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </motion.div>
          )}
          
          {/* Information Confirmation */}
          <label className="flex items-start space-x-3 cursor-pointer group pt-4 border-t border-white/20">
            <input
              type="checkbox"
              checked={informationConfirmed}
              onChange={() => setInformationConfirmed(!informationConfirmed)}
              className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-400/50 cursor-pointer transition-all"
            />
            <span className="text-sm text-white/80 group-hover:text-white/100 transition-colors">
              I confirm that <strong>all the information I have provided is correct to the best of my knowledge</strong> and I agree to the terms and conditions of this booking.
            </span>
          </label>

          {/* Accept Terms Button */}
          {isAwaitingResponse ? (
            <motion.div
              className="flex flex-col items-center justify-center space-y-3 bg-blue-500/20 text-blue-300 px-6 py-6 rounded-xl border border-blue-400/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium text-lg">Awaiting response from sales team...</span>
              </div>
              <p className="text-sm text-blue-200/80 text-center">
                Your booking request has been submitted. Our sales team will review it shortly. Please keep this page open.
              </p>
              <p className="text-xs text-blue-200/60 text-center">
                Checking for updates every 5 seconds...
              </p>
              {lastPollTime && (
                <p className="text-xs text-blue-200/50 text-center">
                  Last checked: {lastPollTime.toLocaleTimeString()}
                </p>
              )}
            </motion.div>
          ) : salesResponseStatus === 'declined' ? (
            <motion.div
              className="bg-red-500/20 text-red-300 px-6 py-6 rounded-xl border border-red-400/30 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-semibold text-lg mb-2">Request Declined</p>
              <p className="text-sm">Our sales team will call you shortly to discuss your booking.</p>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={handleAcceptTermsAndProceed}
              disabled={!canAcceptTerms}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl border border-white/20 mt-4"
              whileHover={{ scale: canAcceptTerms ? 1.02 : 1 }}
              whileTap={{ scale: canAcceptTerms ? 0.98 : 1 }}
            >
              {!informationConfirmed 
                ? 'Please Confirm Information to Continue' 
                : !formData.checkInDate || !formData.checkOutDate 
                  ? 'Please Select Dates to Continue'
                  : !formData.guestPhone.trim()
                    ? 'Please Enter Phone Number to Continue'
                    : formData.purposeOfVisit === ''
                      ? 'Please Select Purpose of Visit'
                      : formData.purposeOfVisit === 'others' && !formData.otherPurpose.trim()
                        ? 'Please Specify Your Purpose'
                        : 'Confirm & Continue'
              }
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Special Requests */}
      {termsAccepted && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label className="block text-sm font-medium text-white/90 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          rows={3}
          className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 resize-none transition-all duration-300"
          placeholder="Any special requests or requirements..."
        />
      </motion.div>
      )}

      {/* Availability Status */}
      {termsAccepted && (
      <AnimatePresence>
        {availabilityStatus.message && (
          <motion.div
            className={`p-4 rounded-xl border backdrop-blur-md ${
              availabilityStatus.available === true
                ? 'bg-green-500/20 border-green-400/30 text-green-300'
                : availabilityStatus.available === false
                ? 'bg-red-500/20 border-red-400/30 text-red-300'
                : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm">{availabilityStatus.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      {/* Booking Summary */}
      {termsAccepted && numberOfNights > 0 && (
        <motion.div 
          className="border-t border-white/20 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-3 border border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between text-sm text-white/80">
              <span>Price per night:</span>
              <span className="font-medium">₹{pricePerNight.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-white/80">
              <span>Number of nights:</span>
              <span className="font-medium">{numberOfNights}</span>
            </div>
            <div className="flex justify-between text-sm text-white/80">
              <span>Number of guests:</span>
              <span className="font-medium">{formData.numberOfGuests}</span>
            </div>
            {customOffer && customOfferDetails?.customOffer && (
              <>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Original Total:</span>
                    <span className="line-through">₹{customOfferDetails.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-yellow-300 font-semibold mt-2">
                    <span>Special Discount:</span>
                    <span>-₹{customOfferDetails.customOffer.discountAmount.toLocaleString()} ({customOfferDetails.customOffer.discountPercentage.toFixed(1)}%)</span>
                  </div>
                </div>
              </>
            )}
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total Amount:</span>
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={customOffer ? "text-green-300" : ""}
                >
                  ₹{(customOffer && customOfferDetails?.customOffer?.adjustedTotalAmount 
                    ? customOfferDetails.customOffer.adjustedTotalAmount 
                    : totalAmount).toLocaleString()}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {termsAccepted && (
      <motion.button
        type="button"
        onClick={handlePayment}
        disabled={isSubmitting || numberOfNights <= 0 || availabilityStatus.available === false || availabilityStatus.checking}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl border border-white/20"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
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
          `Book Now & Pay ₹${(customOffer && customOfferDetails?.customOffer?.adjustedTotalAmount 
            ? customOfferDetails.customOffer.adjustedTotalAmount 
            : totalAmount).toLocaleString()}`
        )}
      </motion.button>
      )}
    </motion.div>
  );
}
