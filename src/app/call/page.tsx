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
  maxGuests: number;
}

export default function CallBookingPage() {
  const router = useRouter();
  
  // Customer search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [allUsers, setAllUsers] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all users on mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

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
        const fullName = `${user.name || ''}`.toLowerCase();
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
    // Store customer data and navigate to booking page
    localStorage.setItem('selectedCallCustomer', JSON.stringify(customer));
    router.push('/call/booking');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">📞 Call Booking Management</h1>
          <p className="text-white/70">Create bookings from phone or WhatsApp enquiries</p>
        </motion.div>

        {/* Customer Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">1. Select Customer</h2>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, phone number, or email..."
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
                    <p className="text-white font-semibold text-lg">{customer.name}</p>
                    <p className="text-blue-300 text-sm mb-1">@{customer.username}</p>
                    <p className="text-white/70 text-sm">📱 {customer.phone}</p>
                    <p className="text-white/70 text-sm">📧 {customer.email}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {showDropdown && searchQuery.trim() && searchResults.length === 0 && (
            <div className="mt-4 text-center text-white/70 py-8">
              No customers found matching "{searchQuery}"
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
