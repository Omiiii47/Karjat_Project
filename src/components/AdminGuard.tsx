'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to login
        router.push('/login?redirect=/admin/cms');
        return;
      }

      if (user.role !== 'admin') {
        // User is not admin, redirect to home
        router.push('/');
        return;
      }

      // User is admin, allow access
      setIsChecking(false);
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user is not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Access Denied!</strong>
            <span className="block sm:inline"> You need admin privileges to access this page.</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // User is admin, render the protected content
  return <>{children}</>;
}
