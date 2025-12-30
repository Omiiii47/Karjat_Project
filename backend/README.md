# Villa Booking Backend API

Separate backend server for the Villa Booking System running on port 4000.

## Features

- ✅ Separate Node.js/Express backend
- ✅ MongoDB database connection
- ✅ CORS enabled for multiple frontends (3000, 3001)
- ✅ Booking request management
- ✅ Sales team authentication
- ✅ Real-time status polling

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and credentials

3. **Start Server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Booking Endpoints
- `POST /api/booking/request` - Submit new booking request
- `GET /api/booking/request/:id` - Get booking request status

### Sales Endpoints
- `POST /api/sales/login` - Sales team login
- `GET /api/sales/requests?status=pending` - Get booking requests by status
- `PATCH /api/sales/requests/:id` - Update booking status (accept/decline)

### Health Check
- `GET /health` - Server health status

## Architecture

```
Frontend (User)    → http://localhost:3000 ──┐
                                              │
Frontend (Sales)   → http://localhost:3001 ──┼─→ Backend API → MongoDB
                                              │   (Port 4000)
                                              │
Future Frontend    → http://localhost:3002 ──┘
```

## Port Configuration

- **Backend API**: 4000
- **User Frontend**: 3000
- **Sales Frontend**: 3001 (optional)

## Development

The backend runs independently from Next.js and provides a stable API for:
- Real-time booking status updates
- Sales team dashboard
- User booking requests
- No more crashes from shared state!

## Environment Variables

Required in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `BACKEND_PORT` - API server port (default: 4000)
- `SALES_EMAIL` - Sales team login email
- `SALES_PASSWORD` - Sales team login password
