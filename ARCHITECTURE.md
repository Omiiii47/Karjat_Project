# 🏠 Villa Booking System - Full Stack Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
├─────────────────────────────────────────────────────────────┤
│  User Frontend (3000)      Sales Frontend (3001)            │
│  - Browse villas            - View booking requests         │
│  - Submit requests          - Accept/Decline bookings       │
│  - Check status             - Real-time updates             │
└──────────────────┬────────────────────┬─────────────────────┘
                   │                    │
                   ▼                    ▼
         ┌─────────────────────────────────────────┐
         │     Backend API Server (Port 4000)       │
         ├─────────────────────────────────────────┤
         │  - Express.js REST API                   │
         │  - Booking request management            │
         │  - Sales team authentication             │
         │  - Real-time status polling              │
         │  - CORS enabled for multiple frontends   │
         └───────────────────┬─────────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  MongoDB Atlas   │
                   │  - Bookings DB   │
                   │  - User data     │
                   └──────────────────┘
```

## 🚀 Quick Start

### Option 1: Start Everything (Recommended)
```bash
# Windows
start-all.bat

# This will start:
# - Backend API on port 4000
# - Frontend on port 3000
```

### Option 2: Start Individually

**Backend API:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

## 📦 Project Structure

```
villa-booking-system/
├── backend/                    # Separate Node.js backend
│   ├── src/
│   │   ├── config/            # Database config
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   │   ├── booking.js     # Booking endpoints
│   │   │   └── sales.js       # Sales endpoints
│   │   └── server.js          # Express server
│   ├── .env                   # Backend environment
│   └── package.json
│
├── src/                       # Next.js frontend
│   ├── app/                   # Pages
│   │   ├── sales/            # Sales dashboard
│   │   ├── my-booking-requests/
│   │   └── villa/[id]/
│   ├── components/            # React components
│   ├── config/
│   │   └── api.ts            # API configuration
│   └── lib/
│
├── .env.local                # Frontend environment
├── start-all.bat             # Start all services
└── stop-all.bat              # Stop all services
```

## 🔌 API Endpoints

### Booking Endpoints (Port 4000)
- `POST /api/booking/request` - Submit new booking request
- `GET /api/booking/request/:id` - Get booking status

### Sales Endpoints (Port 4000)
- `POST /api/sales/login` - Sales team login
- `GET /api/sales/requests?status=pending` - Get booking requests
- `PATCH /api/sales/requests/:id` - Accept/Decline booking

## 🔧 Configuration

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
BACKEND_PORT=4000
SALES_EMAIL=sales@solscape.com
SALES_PASSWORD=sales123
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_key
```

## 🎯 Features

### Separate Backend Benefits
- ✅ **No More Crashes** - Independent backend prevents frontend crashes
- ✅ **Better Performance** - Dedicated API server handles all requests
- ✅ **Real-time Updates** - Efficient polling without blocking UI
- ✅ **Multiple Frontends** - Support user (3000) and sales (3001) apps
- ✅ **Scalable** - Easy to deploy backend separately
- ✅ **Stable State** - MongoDB-backed persistent storage

### User Features
- Browse available villas
- Submit booking requests
- Real-time status tracking
- Payment integration (Stripe/Razorpay)

### Sales Features  
- Login authentication
- View all booking requests
- Accept/Decline requests
- Real-time dashboard updates

## 🔄 Workflow

1. **User** submits booking request → **Backend API** → **MongoDB**
2. **Sales team** logs in → Views requests from **Backend API**
3. **Sales** accepts/declines → Updates in **MongoDB**
4. **User** polls status → Gets updates from **Backend API**
5. **User** continues to payment (if accepted)

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev  # Starts Next.js on port 3000
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Sales Login**: http://localhost:3000/sales
- **API Health**: http://localhost:4000/health

## 📝 Environment Setup

1. Copy `.env.example` to `.env` (backend)
2. Copy `.env.local.example` to `.env.local` (frontend)
3. Update MongoDB URI in both files
4. Set sales credentials in backend `.env`

## 🚀 Deployment

### Backend (API)
- Deploy to: Heroku, Railway, Render, or any Node.js host
- Set environment variables
- Use production MongoDB

### Frontend
- Deploy to: Vercel, Netlify
- Set `NEXT_PUBLIC_API_URL` to production backend URL

## 🐛 Troubleshooting

**Backend not starting?**
- Check MongoDB connection string
- Ensure port 4000 is available
- Verify .env file exists

**Frontend can't reach backend?**
- Check `NEXT_PUBLIC_API_URL` in .env.local
- Ensure backend is running on port 4000
- Check CORS settings in backend

**Polling not working?**
- Verify booking request ID is saved correctly
- Check browser console for API errors
- Ensure MongoDB connection is stable

## 📄 License

MIT
