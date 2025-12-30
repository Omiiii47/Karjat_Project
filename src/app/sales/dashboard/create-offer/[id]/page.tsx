'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingRequest {
  _id: string;
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
  purposeOfVisit: string;
  otherPurpose?: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  specialRequests?: string;
  status: string;
}

export default function CreateCustomOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;
  const router = useRouter();

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [adjustedPricePerNight, setAdjustedPricePerNight] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [salesNotes, setSalesNotes] = useState('');
  const [offerValidDays, setOfferValidDays] = useState(7);

  // Calculated values
  const [adjustedTotal, setAdjustedTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  // Calculate nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      setNumberOfNights(nights > 0 ? nights : 0);
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    if (adjustedPricePerNight > 0 && numberOfNights > 0) {
      const newTotal = adjustedPricePerNight * numberOfNights;
      const originalTotal = booking ? booking.pricePerNight * numberOfNights : 0;
      const discount = originalTotal - newTotal;
      const discountPercent = originalTotal > 0 ? (discount / originalTotal) * 100 : 0;

      setAdjustedTotal(newTotal);
      setDiscountAmount(discount);
      setDiscountPercentage(discountPercent);
    }
  }, [adjustedPricePerNight, numberOfNights, booking]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/booking/request/${bookingId}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.bookingRequest);
        setAdjustedPricePerNight(data.bookingRequest.pricePerNight);
        setCheckInDate(data.bookingRequest.checkInDate.split('T')[0]);
        setCheckOutDate(data.bookingRequest.checkOutDate.split('T')[0]);
        setNumberOfNights(data.bookingRequest.numberOfNights);
      } else {
        alert('Failed to fetch booking details');
        router.push('/sales/dashboard');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Error loading booking details');
      router.push('/sales/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adjustedPricePerNight <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (!salesNotes.trim()) {
      alert('Please add notes for the customer');
      return;
    }

    setSubmitting(true);

    try {
      const offerData = {
        adjustedPricePerNight,
        adjustedTotalAmount: adjustedTotal,
        discountAmount,
        discountPercentage,
        salesNotes: salesNotes.trim(),
        offerValidDays
      };

      const response = await fetch(`http://localhost:4000/api/sales/requests/${bookingId}/custom-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Custom offer sent successfully! Customer will see this in their pending requests.');
        router.push('/sales/dashboard');
      } else {
        alert(data.message || 'Failed to send custom offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Failed to send custom offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Custom Offer</h1>
          <p className="text-gray-600 mb-8">Adjust the price and send a personalized offer to the customer</p>

          {/* Booking Details Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Villa</p>
                <p className="font-semibold text-gray-900">{booking.villaName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guest</p>
                <p className="font-semibold text-gray-900">{booking.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in (Original)</p>
                <p className="font-semibold text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out (Original)</p>
                <p className="font-semibold text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nights (Original)</p>
                <p className="font-semibold text-gray-900">{booking.numberOfNights} nights</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-semibold text-gray-900">{booking.numberOfAdults} Adults, {booking.numberOfKids} Kids</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Original Price/Night</p>
                <p className="font-semibold text-lg text-gray-900">₹{booking.pricePerNight.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Original Total</p>
                <p className="font-semibold text-lg text-gray-900">₹{booking.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Special Requests</p>
                <p className="text-gray-900">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Custom Offer Form */}
          <form onSubmit={handleSubmitOffer}>
            <div className="space-y-6">
              {/* Editable Dates */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Adjust Booking Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 text-center bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">Number of Nights</p>
                  <p className="text-2xl font-bold text-blue-600">{numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}</p>
                </div>
              </div>

              {/* Adjusted Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjusted Price Per Night (₹) *
                </label>
                <input
                  type="number"
                  value={adjustedPricePerNight}
                  onChange={(e) => setAdjustedPricePerNight(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 font-semibold"
                  required
                  min="1"
                  step="1"
                />
              </div>

              {/* Price Comparison */}
              {adjustedPricePerNight > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Price Comparison</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">New Total</p>
                      <p className="text-2xl font-bold text-green-600">₹{adjustedTotal.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="text-2xl font-bold text-blue-600">₹{discountAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Discount %</p>
                      <p className="text-2xl font-bold text-purple-600">{discountPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Customer *
                </label>
                <textarea
                  value={salesNotes}
                  onChange={(e) => setSalesNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={6}
                  required
                  placeholder="E.g., 'We're pleased to offer you a special discount for this booking. This includes complimentary breakfast and airport pickup. Please complete payment within 7 days to secure this rate.'"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This message will be visible to the customer along with the adjusted price.
                </p>
              </div>

              {/* Offer Validity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Valid For (Days)
                </label>
                <select
                  value={offerValidDays}
                  onChange={(e) => setOfferValidDays(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
                >
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Customer will be notified at:</p>
                <p className="font-semibold text-gray-900">📧 {booking.guestEmail}</p>
                <p className="font-semibold text-gray-900">📱 {booking.guestPhone}</p>
              </div>

              {/* Success Note */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ After clicking "Send Custom Offer", the customer will see this offer in their <strong>Pending Requests</strong> page with the adjusted price and your message.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={submitting}
                >
                  {submitting ? 'Sending Offer...' : 'Send Custom Offer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
