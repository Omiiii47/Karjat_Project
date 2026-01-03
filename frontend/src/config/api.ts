// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Booking endpoints
  SUBMIT_BOOKING_REQUEST: `${API_BASE_URL}/api/booking/request`,
  GET_BOOKING_REQUEST: (id: string) => `${API_BASE_URL}/api/booking/request/${id}`,
  
  // Sales endpoints
  SALES_LOGIN: `${API_BASE_URL}/api/sales/login`,
  GET_SALES_REQUESTS: `${API_BASE_URL}/api/sales/requests`,
  UPDATE_BOOKING_STATUS: (id: string) => `${API_BASE_URL}/api/sales/requests/${id}`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};
