'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to villas page
    router.replace('/villas');
  }, [router]);

  // Show loading state while redirecting
  // return (
  //   <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //     <div className="text-center">
  //       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //       <p className="text-gray-600">Redirecting to villas...</p>
  //     </div>
  //   </div>
  // );
}
