import Razorpay from 'razorpay';

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  publicKeyId: string;
}

const validateRazorpayConfig = (): RazorpayConfig => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId || !keySecret || !publicKeyId) {
    throw new Error('Missing required Razorpay environment variables');
  }

  // Validate key format (Razorpay keys should start with rzp_)
  if (!keyId.startsWith('rzp_') || !publicKeyId.startsWith('rzp_')) {
    throw new Error('Invalid Razorpay key format - keys should start with "rzp_"');
  }

  // Ensure test keys match
  if (keyId.includes('test') !== publicKeyId.includes('test')) {
    throw new Error('Razorpay key mismatch - both keys should be test or live');
  }

  return { keyId, keySecret, publicKeyId };
};

let razorpayInstance: Razorpay;

try {
  const config = validateRazorpayConfig();
  razorpayInstance = new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
} catch (error) {
  console.error('Razorpay configuration error:', error);
  // Create a dummy instance to prevent app crashes
  razorpayInstance = {} as Razorpay;
}

export const razorpay = razorpayInstance;

// TypeScript definitions following your modular component approach
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdrop_close?: boolean;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
  on?(event: string, handler: (response: any) => void): void;
}

// Global window interface for mobile-first design
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}