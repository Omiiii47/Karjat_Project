'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

interface Booking {
  _id: string;
  villaId: string;
  villaName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  specialRequests?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, paymentFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/bookings?page=${currentPage}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (paymentFilter) url += `&paymentStatus=${paymentFilter}`;

      const token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token ? 'Found' : 'NOT FOUND');
      console.log('📡 Fetching bookings from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bookings data received:', data);
        setBookings(data.bookings);
        setTotalPages(data.pagination.pages);
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching bookings:', errorData);
        setError(errorData.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingStatus: status }),
      });

      if (response.ok) {
        await fetchBookings(); // Refresh the list
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: status }),
      });

      if (response.ok) {
        await fetchBookings(); // Refresh the list
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      alert('Failed to update payment status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading bookings...</div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
              <p className="mt-2 text-gray-600">
                Manage customer bookings, payments, and reservations
              </p>
            </div>
            <Link
              href="/admin/cms"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to CMS
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Booking Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Payment Status
                </label>
                <select
                  id="paymentFilter"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.villaName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-900">
                            ₹{booking.totalAmount || booking.pricing?.totalAmount || 0}
                          </div>
                          <div className="text-sm text-gray-900">
                            {booking.guests || booking.totalGuests || 0} guests
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.userName || booking.customerDetails?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-900">
                            {booking.userEmail || booking.customerDetails?.email || 'N/A'}
                          </div>
                          {(booking.userPhone || booking.customerDetails?.phone) && (
                            <div className="text-sm text-gray-900">
                              {booking.userPhone || booking.customerDetails?.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </div>
                        <div className="text-sm text-gray-900">
                          Booked: {formatDate(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="space-y-2">
                          <select
                            onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                            className="w-full text-sm text-gray-900 bg-white border-2 border-blue-500 rounded-lg px-3 py-2 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue=""
                          >
                            <option value="" disabled className="text-gray-900">Change Status</option>
                            <option value="pending" className="text-gray-900">Pending</option>
                            <option value="confirmed" className="text-gray-900">Confirmed</option>
                            <option value="cancelled" className="text-gray-900">Cancelled</option>
                            <option value="completed" className="text-gray-900">Completed</option>
                            <option value="refunded" className="text-gray-900">Refunded</option>
                          </select>
                          <select
                            onChange={(e) => updatePaymentStatus(booking._id, e.target.value)}
                            className="w-full text-sm text-gray-900 bg-white border-2 border-green-500 rounded-lg px-3 py-2 font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                            defaultValue=""
                          >
                            <option value="" disabled className="text-gray-900">Payment Status</option>
                            <option value="pending" className="text-gray-900">Pending</option>
                            <option value="paid" className="text-gray-900">Paid</option>
                            <option value="failed" className="text-gray-900">Failed</option>
                            <option value="refunded" className="text-gray-900">Refunded</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {bookings.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Bookings will appear here when customers make reservations.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
