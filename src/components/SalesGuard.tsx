'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SalesGuardProps {
  children: React.ReactNode;
}

export default function SalesGuard({ children }: SalesGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('salesToken');
      const salesUser = localStorage.getItem('salesUser');

      if (!token || !salesUser) {
        // No credentials, redirect to sales login
        router.push('/sales');
        return;
      }

      try {
        const user = JSON.parse(salesUser);
        if (user.role === 'sales') {
          setIsAuthorized(true);
        } else {
          // Not a sales user
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error parsing sales user:', error);
        router.push('/sales/login');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking sales access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user is not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Access Denied!</strong>
            <span className="block sm:inline"> You need sales team privileges to access this page.</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // User is authorized, render the protected content
  return <>{children}</>;
}
