import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { RazorpayOrderRequest, RazorpayOrderResponse, RazorpayOrder } from '@/types/razorpay';

export async function POST(request: NextRequest) {
  try {
    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials in environment');
      return NextResponse.json(
        { error: 'Payment service is temporarily unavailable' },
        { status: 503 }
      );
    }

    const body: RazorpayOrderRequest = await request.json();
    const { villaId, villaName, price } = body;

    // Comprehensive input validation following mobile-first principles
    if (!villaId?.trim() || !villaName?.trim()) {
      return NextResponse.json(
        { error: 'Villa information is required' },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 1000000) {
      return NextResponse.json(
        { error: 'Invalid price amount' },
        { status: 400 }
      );
    }

    // Generate unique receipt ID
    const timestamp = Date.now();
    const receiptId = `villa_${villaId}_${timestamp}`;

    console.log('Creating Razorpay order:', {
      villaId: villaId.substring(0, 8) + '...',
      villaName,
      price: numericPrice,
      receiptId
    });

    // Create Razorpay order with enhanced configuration
    const orderOptions = {
      amount: Math.round(numericPrice * 100), // Convert to paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        villa_id: String(villaId),
        villa_name: String(villaName),
        booking_type: 'villa_rental',
        created_at: new Date().toISOString(),
      },
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(orderOptions) as RazorpayOrder;

    if (!order || !order.id) {
      throw new Error('Failed to create order - invalid response from Razorpay');
    }

    console.log('Razorpay order created successfully:', {
      orderId: order.id,
      amount: order.amount,
      status: order.status
    });

    // Properly handle type conversion with validation
    const orderAmount = typeof order.amount === 'number' 
      ? order.amount 
      : parseInt(String(order.amount), 10);

    const orderReceipt = order.receipt || receiptId;

    const response: RazorpayOrderResponse = {
      orderId: order.id,
      amount: orderAmount,
      currency: order.currency,
      receipt: orderReceipt,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Razorpay order creation failed:', {
      message: error.message,
      statusCode: error.statusCode,
      description: error.description,
      source: error.source,
      step: error.step,
      reason: error.reason,
      field: error.field,
    });

    // Handle specific Razorpay error codes with mobile-first error messaging
    switch (error.statusCode) {
      case 400:
        return NextResponse.json(
          { error: 'Invalid payment details provided' },
          { status: 400 }
        );
      
      case 401:
        return NextResponse.json(
          { error: 'Payment service authentication failed' },
          { status: 401 }
        );
      
      case 429:
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return NextResponse.json(
          { error: 'Payment service temporarily unavailable. Please try again.' },
          { status: 503 }
        );
      
      default:
        return NextResponse.json(
          { error: 'Payment processing failed. Please contact support if this continues.' },
          { status: 500 }
        );
    }
  }
}