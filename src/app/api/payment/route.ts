import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { amount } = body; // e.g., 500 (in INR)

  try {
    const options = {
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}
