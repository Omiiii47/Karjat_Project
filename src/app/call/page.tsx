'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
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
  maxGuests: number;
}

export default function CallBookingPage() {
  // Customer search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [allUsers, setAllUsers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Villa selection
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [expandedVillaId, setExpandedVillaId] = useState<string | null>(null);
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

  // Fetch all users on mount
  useEffect(() => {
    fetchAllUsers();
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

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users/all');
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users || []);
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (!value.trim()) {
      setSearchResults(allUsers);
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
      // Filter users by username, name, phone, or email
      const filtered = allUsers.filter(user => {
        const searchLower = value.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone.includes(value)
        );
      });
      setSearchResults(filtered);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      setSubmitError('Please select a customer');
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
        guestName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        guestEmail: selectedCustomer.email,
        guestPhone: selectedCustomer.phone,
        checkInDate,
        checkOutDate,
        numberOfGuests: numberOfAdults + numberOfKids,
        numberOfAdults,
        numberOfKids,
        numberOfPets,
        purposeOfVisit,
        otherPurpose,
        numberOfNights,
        pricePerNight: selectedVilla.price,
        totalAmount,
        specialRequests: specialNotes,
        bookingType: 'call',
        bookingSource: 'CALL',
        userId: selectedCustomer._id
      };

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setSubmitError(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setSubmitError('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedVilla(null);
    setExpandedVillaId(null);
    setSearchQuery('');
    setCheckInDate('');
    setCheckOutDate('');
    setNumberOfAdults(1);
    setNumberOfKids(0);
    setNumberOfPets(0);
    setPurposeOfVisit('');
    setOtherPurpose('');
    setSpecialNotes('');
    setSubmitSuccess(false);
    setSubmitError('');
    setShowDropdown(false);
    setSearchResults(allUsers);
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
            <h2 className="text-2xl font-bold text-white mb-2">Booking Created!</h2>
            <p className="text-white/80 mb-6">
              Booking has been successfully created for {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </p>
            <button
              onClick={resetForm}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all"
            >
              Create Another Booking
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">📞 Call Booking Management</h1>
          <p className="text-white/70">Create bookings from phone or WhatsApp enquiries</p>
        </motion.div>

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* Customer Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">1. Select Customer</h2>
            
            {!selectedCustomer ? (
              <>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by name or phone number..."
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                {/* Search Results Dropdown - Only show when searching */}
                <AnimatePresence>
                  {showDropdown && searchQuery.trim() && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2 max-h-96 overflow-y-auto"
                    >
                      {searchResults.map((customer) => (
                        <button
                          key={customer._id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-left transition-all"
                        >
                          <p className="text-white font-semibold text-lg">{customer.firstName} {customer.lastName}</p>
                          <p className="text-blue-300 text-sm mb-1">@{customer.username}</p>
                          <p className="text-white/70 text-sm">📱 {customer.phone}</p>
                          <p className="text-white/70 text-sm">📧 {customer.email}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold text-lg">✓ {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                    <p className="text-blue-300 text-sm mb-1">@{selectedCustomer.username}</p>
                    <p className="text-white/80 text-sm">📱 {selectedCustomer.phone}</p>
                    <p className="text-white/80 text-sm">📧 {selectedCustomer.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    ✕ Change
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Villa Cards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Villas</h2>
            
            {villasLoading ? (
              <p className="text-white/70">Loading villas...</p>
            ) : villas.length === 0 ? (
              <p className="text-white/70">No villas available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {villas.map((villa) => (
                  <div key={villa._id} className="bg-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-white/40 transition-all">
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedVillaId === villa._id) {
                          setExpandedVillaId(null);
                          setSelectedVilla(null);
                        } else {
                          setExpandedVillaId(villa._id);
                          setSelectedVilla(villa);
                        }
                      }}
                      className="w-full text-left"
                    >
                      {/* Villa Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50 overflow-hidden">
                        {villa.images && villa.images.length > 0 ? (
                          <img
                            src={villa.images[0]}
                            alt={villa.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Villa+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}
                        {selectedVilla?._id === villa._id && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            Selected
                          </div>
                        )}
                      </div>
                      
                      {/* Villa Name */}
                      <div className="p-4">
                        <h3 className="text-white font-bold text-lg mb-1">{villa.name}</h3>
                        <p className="text-white/60 text-sm">📍 {villa.location}</p>
                      </div>
                    </button>
                    
                    {/* Expandable Details */}
                    <AnimatePresence>
                      {expandedVillaId === villa._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/50 text-xs uppercase mb-1">Price</p>
                                <p className="text-green-300 font-bold">₹{villa.price.toLocaleString()}/night</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/50 text-xs uppercase mb-1">Bedrooms</p>
                                <p className="text-white font-semibold">🛏️ {villa.bedrooms}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/50 text-xs uppercase mb-1">Bathrooms</p>
                                <p className="text-white font-semibold">🚿 {villa.bathrooms}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/50 text-xs uppercase mb-1">Max Guests</p>
                                <p className="text-white font-semibold">👥 {villa.maxGuests}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Booking Details Section */}
          {selectedCustomer && selectedVilla && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-4"
            >
              <h2 className="text-xl font-bold text-white mb-4">3. Booking Details</h2>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Check-in Date *</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Check-out Date *</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Adults *</label>
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
                  <label className="block text-white/90 text-sm font-medium mb-2">Kids</label>
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
                  <label className="block text-white/90 text-sm font-medium mb-2">Pets</label>
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
                <label className="block text-white/90 text-sm font-medium mb-2">Purpose of Visit *</label>
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
          {selectedCustomer && selectedVilla && (
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
                  Creating Booking...
                </span>
              ) : (
                'Create Call Booking'
              )}
            </motion.button>
          )}
        </form>
      </div>
    </div>
  );
}
