'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

export default function CMSAdminPage() {
  const [stats, setStats] = useState({
    totalVillas: 0,
    activeVillas: 0,
    totalContacts: 0,
    newContacts: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch villa stats
      const villasResponse = await fetch('/api/admin/villas?includeInactive=true');
      const villasData = await villasResponse.json();
      
      // Fetch contact stats
      const contactsResponse = await fetch('/api/contact');
      const contactsData = await contactsResponse.json();

      // Fetch booking stats
      const bookingsResponse = await fetch('/api/booking');
      const bookingsData = await bookingsResponse.json();

      setStats({
        totalVillas: villasData.pagination?.total || 0,
        activeVillas: villasData.villas?.filter((v: any) => v.isActive !== false).length || 0,
        totalContacts: contactsData.pagination?.total || 0,
        newContacts: contactsData.contacts?.filter((c: any) => c.status === 'new').length || 0,
        totalBookings: bookingsData.pagination?.total || 0,
        pendingBookings: bookingsData.bookings?.filter((b: any) => b.bookingStatus === 'pending').length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, description, color }: {
    title: string;
    value: number;
    description: string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-8 h-8 ${color} rounded-md flex items-center justify-center`}>
          <div className="w-4 h-4 bg-white rounded"></div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management System</h1>
          <p className="mt-2 text-gray-600">
            Manage your villa listings, site content, and view analytics
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading dashboard...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              title="Total Villas"
              value={stats.totalVillas}
              description="All villa listings"
              color="bg-blue-500"
            />
            <StatCard
              title="Active Villas"
              value={stats.activeVillas}
              description="Currently published"
              color="bg-green-500"
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              description="All reservations"
              color="bg-orange-500"
            />
            <StatCard
              title="Pending Bookings"
              value={stats.pendingBookings}
              description="Awaiting confirmation"
              color="bg-yellow-500"
            />
            <StatCard
              title="Total Contacts"
              value={stats.totalContacts}
              description="All inquiries received"
              color="bg-purple-500"
            />
            <StatCard
              title="New Contacts"
              value={stats.newContacts}
              description="Unread messages"
              color="bg-orange-500"
            />
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Villa Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">Villa Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Add, edit, and manage your villa listings with photos and details.
            </p>
            <div className="space-y-2">
              <Link
                href="/admin/cms/villas"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Villas
              </Link>
              <Link
                href="/admin/cms/villas/new"
                className="block w-full bg-blue-100 text-blue-700 text-center py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Add New Villa
              </Link>
            </div>
          </div>

          {/* Booking Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">Booking Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View, manage, and update reservation status and payment information.
            </p>
            <Link
              href="/admin/bookings"
              className="block w-full bg-orange-600 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Manage Bookings
            </Link>
          </div>

          {/* Site Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">Site Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Update site information, hero images, contact details, and SEO settings.
            </p>
            <Link
              href="/admin/cms/site-settings"
              className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Site Settings
            </Link>
          </div>

          {/* Contact Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">Contact Inquiries</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View and respond to customer inquiries and contact form submissions.
            </p>
            <Link
              href="/admin/contacts"
              className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Contacts
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              View Website
            </button>
            <button
              onClick={fetchStats}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh Stats
            </button>
            <Link
              href="/admin/cms/backup"
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
              </svg>
              Backup Data
            </Link>
          </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
