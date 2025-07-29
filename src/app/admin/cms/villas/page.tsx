'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Villa {
  _id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images: string[];
  features: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export default function VillasManagementPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVillas();
  }, [currentPage]);

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/villas?page=${currentPage}&limit=10&includeInactive=true`);
      if (response.ok) {
        const data = await response.json();
        setVillas(data.villas);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to fetch villas');
      }
    } catch (error) {
      setError('Failed to fetch villas');
    } finally {
      setLoading(false);
    }
  };

  const deleteVilla = async (id: string) => {
    if (!confirm('Are you sure you want to delete this villa? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/villas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchVillas(); // Refresh the list
      } else {
        alert('Failed to delete villa');
      }
    } catch (error) {
      alert('Failed to delete villa');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && villas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading villas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Villa Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your villa listings, photos, and details
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/cms"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to CMS
            </Link>
            <Link
              href="/admin/cms/villas/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Villa
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Villas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {villas.map((villa) => (
            <div key={villa._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {villa.images && villa.images.length > 0 ? (
                  <img
                    src={villa.images[0]}
                    alt={villa.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{villa.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{villa.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{villa.location}</span>
                  <span>₹{villa.price}/night</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{villa.bedrooms} bed • {villa.bathrooms} bath</span>
                  <span>Max {villa.maxGuests} guests</span>
                </div>
                
                <div className="text-xs text-gray-400 mb-4">
                  Created: {formatDate(villa.createdAt)}
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/admin/cms/villas/${villa._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/villa/${villa._id}`}
                    target="_blank"
                    className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deleteVilla(villa._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {villas.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No villas found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first villa listing.</p>
            <Link
              href="/admin/cms/villas/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Villa
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
