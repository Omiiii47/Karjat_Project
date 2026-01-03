'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
}

interface Villa {
  _id: string;
  name: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images?: string[];
}

export default function CallBookingFormPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Villa selection
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [villasLoading, setVillasLoading] = useState(false);

  // Booking form
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfKids, setNumberOfKids] = useState(0);
  const [numberOfPets, setNumberOfPets] = useState(0);
  const [purposeOfVisit, setPurposeOfVisit] = useState('');
  const [otherPurpose, setOtherPurpose] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Calculated values
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Get customer from localStorage
    const customerData = localStorage.getItem('selectedCallCustomer');
    if (customerData) {
      setSelectedCustomer(JSON.parse(customerData));
    } else {
      // If no customer selected, redirect back
      router.push('/call');
    }

    // Fetch villas
    fetchVillas();
  }, []);

  // Calculate nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      setNumberOfNights(nights > 0 ? nights : 0);
    }
  }, [checkInDate, checkOutDate]);

  // Calculate total amount
  useEffect(() => {
    if (selectedVilla && numberOfNights > 0) {
      setTotalAmount(selectedVilla.price * numberOfNights);
    } else {
      setTotalAmount(0);
    }
  }, [selectedVilla, numberOfNights]);

  const fetchVillas = async () => {
    setVillasLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/villa');
      const data = await response.json();
      if (data.success) {
        setVillas(data.villas || []);
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
    } finally {
      setVillasLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      setSubmitError('Customer information missing');
      return;
    }

    if (!selectedVilla) {
      setSubmitError('Please select a villa');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setSubmitError('Please select check-in and check-out dates');
      return;
    }

    if (!purposeOfVisit) {
      setSubmitError('Please select purpose of visit');
      return;
    }

    if (purposeOfVisit === 'others' && !otherPurpose.trim()) {
      setSubmitError('Please specify purpose of visit');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const bookingData = {
        villaId: selectedVilla._id,
        villaName: selectedVilla.name,
        guestName: selectedCustomer.name || selectedCustomer.username || selectedCustomer.email,
        guestEmail: selectedCustomer.email,
        guestPhone: selectedCustomer.phone,
        checkInDate,
        checkOutDate,
        numberOfGuests: numberOfAdults + numberOfKids,
        numberOfAdults,
        numberOfKids,
        numberOfPets,
        purposeOfVisit: purposeOfVisit === 'others' ? otherPurpose : purposeOfVisit,
        numberOfNights,
        pricePerNight: selectedVilla.price,
        totalAmount,
        specialRequests: specialNotes,
        bookingType: 'call',
        bookingSource: 'CALL',
        userId: selectedCustomer._id,
        status: 'pending'
      };

      const response = await fetch('/api/sales/booking-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        // Clear localStorage
        localStorage.removeItem('selectedCallCustomer');
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/call');
        }, 3000);
      } else {
        setSubmitError(data.message || 'Failed to create booking request');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setSubmitError('Failed to create booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-400"
            >
              <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Request Sent!</h2>
            <p className="text-white/80 mb-6">
              Booking request has been successfully sent to {selectedCustomer?.name}
            </p>
            <p className="text-white/60 text-sm">Redirecting back to customer selection...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!selectedCustomer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => router.push('/call')}
            className="text-white/70 hover:text-white flex items-center gap-2 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Customer Selection
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Create Call Booking</h1>
          <p className="text-sm sm:text-base text-white/70">Create booking request for {selectedCustomer.name}</p>
        </motion.div>

        <form onSubmit={handleSubmitBooking} className="space-y-4 sm:space-y-6">
          {/* Selected Customer Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Customer Details</h2>
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 sm:p-4">
              <p className="text-white font-semibold text-base sm:text-lg">✓ {selectedCustomer.name}</p>
              <p className="text-blue-300 text-xs sm:text-sm mb-1">@{selectedCustomer.username}</p>
              <p className="text-white/80 text-xs sm:text-sm break-all">📱 {selectedCustomer.phone}</p>
              <p className="text-white/80 text-xs sm:text-sm break-all">📧 {selectedCustomer.email}</p>
            </div>
          </motion.div>

          {/* Villa Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Select Villa</h2>
            
            {villasLoading ? (
              <p className="text-white/70 text-sm">Loading villas...</p>
            ) : villas.length === 0 ? (
              <p className="text-white/70 text-sm">No villas available</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {villas.map((villa) => (
                  <button
                    key={villa._id}
                    type="button"
                    onClick={() => setSelectedVilla(villa)}
                    className={`w-full text-left bg-white/5 border rounded-xl p-3 sm:p-4 transition-all ${
                      selectedVilla?._id === villa._id
                        ? 'border-green-400 bg-green-500/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-base sm:text-lg">{villa.name}</h3>
                        <p className="text-white/60 text-xs sm:text-sm mb-2">📍 {villa.location}</p>
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-white/70">
                          <span>🛏️ {villa.bedrooms} Bedrooms</span>
                          <span>🚿 {villa.bathrooms} Bathrooms</span>
                          <span>👥 Max {villa.maxGuests} Guests</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right self-start sm:self-auto">
                        <p className="text-green-300 font-bold text-lg sm:text-xl">₹{villa.price.toLocaleString()}</p>
                        <p className="text-white/50 text-xs sm:text-sm">per night</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Booking Details */}
          {selectedVilla && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 space-y-3 sm:space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Booking Details</h2>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white/90 text-xs sm:text-sm font-medium mb-2">Check-in Date *</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-xs sm:text-sm font-medium mb-2">Check-out Date *</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              {numberOfNights > 0 && (
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-center">
                  <p className="text-blue-200 text-sm">Number of Nights</p>
                  <p className="text-white font-bold text-2xl">{numberOfNights}</p>
                </div>
              )}

              {/* Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white/90 text-xs sm:text-sm font-medium mb-2">Adults *</label>
                  <select
                    value={numberOfAdults}
                    onChange={(e) => setNumberOfAdults(Number(e.target.value))}
                    required
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-800">
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/90 text-xs sm:text-sm font-medium mb-2">Kids</label>
                  <select
                    value={numberOfKids}
                    onChange={(e) => setNumberOfKids(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i} value={i} className="bg-gray-800">
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/90 text-xs sm:text-sm font-medium mb-2">Pets</label>
                  <select
                    value={numberOfPets}
                    onChange={(e) => setNumberOfPets(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {Array.from({ length: 6 }, (_, i) => (
                      <option key={i} value={i} className="bg-gray-800">
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purpose of Visit */}
              <div>
                <label className="block text-white/90 text-xs sm:text-sm font-medium mb-2">Purpose of Visit *</label>
                <select
                  value={purposeOfVisit}
                  onChange={(e) => setPurposeOfVisit(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="" className="bg-gray-800">Select purpose</option>
                  <option value="vacation" className="bg-gray-800">Vacation/Leisure</option>
                  <option value="celebration" className="bg-gray-800">Celebration/Event</option>
                  <option value="business" className="bg-gray-800">Business/Work</option>
                  <option value="family" className="bg-gray-800">Family Gathering</option>
                  <option value="others" className="bg-gray-800">Others</option>
                </select>
              </div>

              {purposeOfVisit === 'others' && (
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Specify Purpose *</label>
                  <input
                    type="text"
                    value={otherPurpose}
                    onChange={(e) => setOtherPurpose(e.target.value)}
                    required
                    placeholder="Enter purpose of visit"
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Special Notes (Optional)</label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requests or notes..."
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              {/* Total Amount */}
              {totalAmount > 0 && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">Total Amount:</span>
                    <span className="text-green-300 font-bold text-2xl">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-2">
                    {numberOfNights} nights × ₹{selectedVilla.price.toLocaleString()}/night
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 border border-red-400/30 rounded-lg p-4"
              >
                <p className="text-red-300">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          {selectedVilla && (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Booking Request...
                </span>
              ) : (
                'Send Booking Request to Customer'
              )}
            </motion.button>
          )}
        </form>
      </div>
    </div>
  );
}
