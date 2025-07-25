'use client';

import { useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import { RazorpayOptions, RazorpayResponse } from '@/lib/razorpay';

interface RazorpayCheckoutButtonProps {
  villaId: string;
  villaName: string;
  price: number;
  className?: string;
}

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  error?: string;
}

export default function RazorpayCheckoutButton({ 
  villaId, 
  villaName, 
  price, 
  className = '' 
}: RazorpayCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const razorpayInstanceRef = useRef<any>(null);

  const handleScriptLoad = useCallback(() => {
    setScriptLoaded(true);
    setError(null);
    console.log('Razorpay script loaded successfully');
  }, []);

  const handleScriptError = useCallback(() => {
    console.error('Failed to load Razorpay script');
    setError('Failed to load payment system. Please check your internet connection and try again.');
  }, []);

  const validateEnvironment = (): boolean => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError('Payment system configuration error. Please contact support.');
      return false;
    }
    return true;
  };

  const createOrder = async (): Promise<OrderResponse> => {
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

    const data: OrderResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return data;
  };

  const handlePaymentSuccess = useCallback((response: RazorpayResponse) => {
    console.log('Payment successful:', {
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id
    });
    
    // Redirect to success page with payment details
    const successUrl = new URL('/booking/success', window.location.origin);
    successUrl.searchParams.set('payment_id', response.razorpay_payment_id);
    successUrl.searchParams.set('order_id', response.razorpay_order_id);
    successUrl.searchParams.set('signature', response.razorpay_signature);
    
    window.location.href = successUrl.toString();
  }, []);

  const handlePaymentFailure = useCallback((response: any) => {
    console.error('Payment failed:', response.error);
    setIsLoading(false);
    setError(`Payment failed: ${response.error.description || 'Please try again'}`);
  }, []);

  const handleCheckout = useCallback(async (): Promise<void> => {
    // Reset error state
    setError(null);

    // Validate prerequisites
    if (!validateEnvironment()) return;

    if (!scriptLoaded || !window.Razorpay) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Create order
      const orderData = await createOrder();
      const { orderId, amount, currency } = orderData;

      // Configure Razorpay options for mobile-first experience
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount,
        currency: currency,
        name: 'Solscape Villas',
        description: `Booking for ${villaName}`,
        order_id: orderId,
        handler: handlePaymentSuccess,
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            console.log('Payment modal dismissed by user');
          },
          escape: true,
          backdrop_close: false
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      // Create and configure Razorpay instance
      const rzp = new window.Razorpay(options);
      razorpayInstanceRef.current = rzp;

      // Handle payment failure
      if (rzp.on) {
        rzp.on('payment.failed', handlePaymentFailure);
      }

      // Open payment modal
      rzp.open();

    } catch (error: any) {
      console.error('Checkout error:', error);
      
      // Handle specific error cases
      if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (error.message.includes('503') && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setError('Service temporarily unavailable. Retrying...');
        setTimeout(() => handleCheckout(), 2000);
        return;
      } else {
        setError(error.message || 'Payment processing failed. Please try again.');
      }
      
      setIsLoading(false);
    }
  }, [scriptLoaded, villaId, villaName, price, retryCount, handlePaymentSuccess, handlePaymentFailure]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (razorpayInstanceRef.current && razorpayInstanceRef.current.close) {
      razorpayInstanceRef.current.close();
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="w-full space-y-3">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="lazyOnload"
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="text-red-400 mt-0.5 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">{error}</p>
              {retryCount < 2 && (
                <button
                  onClick={() => {
                    setError(null);
                    setRetryCount(0);
                  }}
                  className="text-red-600 text-xs underline mt-1 hover:text-red-800"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={isLoading || !scriptLoaded}
        className={`
          w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
          text-white font-semibold py-4 px-6 rounded-lg
          transition-all duration-300 transform hover:scale-105 disabled:scale-100
          shadow-lg hover:shadow-xl disabled:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={`Book ${villaName} for ₹${price} per night`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Payment...</span>
          </div>
        ) : !scriptLoaded ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading Payment System...</span>
          </div>
        ) : (
          `Book for ₹${price.toLocaleString('en-IN')}/night`
        )}
      </button>
    </div>
  );
}