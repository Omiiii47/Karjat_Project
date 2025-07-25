'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface StripeCheckoutButtonProps {
  villaId: string;
  villaName: string;
  price: number;
  className?: string;
}

export default function StripeCheckoutButton({ 
  villaId, 
  villaName, 
  price, 
  className = '' 
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          villaId,
          villaName,
          price,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`
        w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
        text-white font-semibold py-4 px-6 rounded-lg
        transition-all duration-300 transform hover:scale-105 disabled:scale-100
        shadow-lg hover:shadow-xl disabled:shadow-md
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        `Book for $${price}/night`
      )}
    </button>
  );
}
