export interface RazorpayOrderRequest {
  villaId: string;
  villaName: string;
  price: number;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}