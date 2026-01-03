# Sales Approval System

## Overview
The booking system now requires sales team approval before customers can proceed with payment.

## How It Works

### Customer Side:
1. Customer fills in the booking form with all details
2. Customer clicks "Confirm & Continue"
3. The form shows "Awaiting response from sales team..." with a loading spinner
4. **The loading continues until the sales team responds**
5. If approved: Customer can proceed to payment
6. If declined: Customer is informed that sales team will call them

### Sales Team Side:
1. Access the sales dashboard at: **http://localhost:3002/sales**
2. View all pending booking requests with full details
3. Each request shows:
   - Guest information (name, email, phone)
   - Guest details (adults, kids, pets)
   - Purpose of visit
   - Check-in/out dates and pricing
   - Special requests (if any)
4. Two action buttons:
   - **Accept**: Approves the request, customer can proceed
   - **Decline & Call**: Declines the request, indicating sales team will call

## API Endpoints

### Customer Endpoints:
- `POST /api/sales/booking-request` - Submit a new booking request
- `GET /api/sales/booking-request?id={id}` - Check status of a booking request

### Sales Team Endpoints:
- `GET /api/sales/requests?status={pending|accepted|declined}` - Get all requests by status
- `PATCH /api/sales/requests/{id}` - Accept or decline a request
  ```json
  { "action": "accept" | "decline" }
  ```

## Database Model: BookingRequest
Located at: `src/models/BookingRequest.ts`

Fields:
- Villa and booking details
- Guest information
- numberOfAdults, numberOfKids, numberOfPets
- purposeOfVisit, otherPurpose
- status: 'pending' | 'accepted' | 'declined'
- salesResponse: { action, respondedAt, respondedBy }

## Technical Details

### Polling Mechanism:
- Customer form polls every **3 seconds** to check for sales response
- Polling continues until:
  - Sales team accepts or declines the request
  - 30-minute timeout is reached
- Uses `useRef` for proper interval cleanup

### Auto-refresh:
- Sales dashboard auto-refreshes every **10 seconds** to show new requests

## Testing

1. Start the dev server: `npm run dev`
2. Open customer page: http://localhost:3002/villa/{id}
3. Open sales dashboard: http://localhost:3002/sales (in another browser window)
4. Fill booking form and submit
5. See the request appear in sales dashboard
6. Accept or decline from sales dashboard
7. Customer page should update within 3 seconds

## Environment Variables Required
- `MONGODB_URI` - MongoDB connection string

## Notes
- The system uses MongoDB with Mongoose
- All dates are stored as ISO strings
- Polling automatically stops when component unmounts
- Sales dashboard filters: Pending, Accepted, Declined
