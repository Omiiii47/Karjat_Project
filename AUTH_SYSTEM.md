# User Authentication System Documentation

## Overview
Complete authentication system for the Solscape villa booking application with signup, login, forgot password, and reset password functionality.

## Features

### 1. User Signup
- **Endpoint**: `POST /api/auth/register`
- **Fields**:
  - Full Name (required)
  - Username (required, unique, immutable, 3-20 chars, alphanumeric + underscores)
  - Email (required, unique, must be valid)
  - Password (required, min 8 characters, hashed with bcrypt)
  - Phone (optional)

**Request Example**:
```json
{
  "name": "John Doe",
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "securePass123",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful! Welcome to Solscape!",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isEmailVerified": true
  },
  "token": "jwt-token..."
}
```

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Fields**: Email + Password

**Request Example**:
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response**: Same as signup (includes user object and JWT token)

**Features**:
- Validates email and password
- Checks if account is active/not banned
- Updates last login timestamp
- Increments login count
- Returns JWT token (valid for 7 days)

### 3. Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Field**: Email

**Request Example**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email. Please check your inbox."
}
```

**Features**:
- Generates secure reset token (32 bytes, hashed)
- Token expires in 30 minutes
- Sends email with reset link using Nodemailer
- Prevents email enumeration (always returns success)

### 4. Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Fields**: Token + New Password

**Request Example**:
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Your password has been reset successfully. You can now log in with your new password."
}
```

**Token Verification**:
- **Endpoint**: `GET /api/auth/reset-password?token=...`
- Checks if token is valid and not expired

### 5. User Search (for /call team)
- **Endpoint**: `GET /api/users/search?q=query&field=all`
- **Query Params**:
  - `q`: Search query (min 2 chars)
  - `field`: Search field - `all`, `username`, `email`, or `phone`

**Response**:
```json
{
  "success": true,
  "count": 5,
  "users": [
    {
      "id": "...",
      "username": "johndoe123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLogin": "2025-01-15T12:30:00Z"
    }
  ]
}
```

**Get Specific User**:
- **Endpoint**: `POST /api/users/search`
- **Body**: `{ "username": "johndoe123" }`

## Security Features

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Passwords never stored in plain text

### JWT Authentication
- Token expires in 7 days
- Includes: userId, email, username, role
- Secret key stored in environment variables

### Password Reset
- Tokens hashed with SHA-256
- 30-minute expiration
- One-time use (invalidated after reset)
- Token verification before showing reset form

### Email Validation
- Format validation (regex)
- Blocks common fake domains
- Real email required for signup

### Username Rules
- 3-20 characters
- Only letters, numbers, underscores
- Case-insensitive (stored in lowercase)
- **Immutable** (cannot be changed after signup)
- Must be unique

## Database Schema

```typescript
{
  email: String (required, unique, lowercase)
  username: String (required, unique, lowercase, immutable)
  password: String (hashed)
  name: String (required)
  phone: String (optional)
  role: String (enum: 'user', 'admin', default: 'user')
  isEmailVerified: Boolean (default: true)
  passwordResetToken: String (optional)
  passwordResetExpires: Date (optional)
  isActive: Boolean (default: true)
  isBanned: Boolean (default: false)
  banReason: String (optional)
  lastLogin: Date
  loginCount: Number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

## Frontend Pages

### Signup Page
- **Route**: `/auth/signup`
- Clean, mobile-first design
- Real-time validation
- Auto-login after signup
- Redirects to `/villas` on success

### Login Page
- **Route**: `/auth/login`
- Email + password fields
- "Remember me" option
- "Forgot Password?" link
- Error handling

### Forgot Password Page
- **Route**: `/auth/forgot-password`
- Single email input
- Success message with instructions
- Email sent notification

### Reset Password Page
- **Route**: `/auth/reset-password?token=...`
- Token verification on load
- New password + confirm fields
- Password strength requirements
- Success state with auto-redirect

## Email Configuration

Add to `.env.local`:

```env
# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@solscape.com

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this

# Base URL
NEXTAUTH_URL=http://localhost:3000

# MongoDB
ADMIN_MONGODB_URI=mongodb://localhost:27017/solscape
```

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Create new app password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## Usage Examples

### Frontend - Signup
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe123',
    email: 'john@example.com',
    password: 'securePass123',
    phone: '+1234567890'
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

### Frontend - Login
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePass123'
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.token);
  router.push('/villas');
}
```

### Frontend - Protected API Call
```typescript
const token = localStorage.getItem('token');

const response = await fetch('/api/bookings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Backend - Verify Token
```typescript
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const user = getUserFromToken(authHeader);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // User is authenticated
  console.log('User ID:', user.userId);
  console.log('Username:', user.username);
}
```

## Testing

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test User Search
```bash
curl http://localhost:3000/api/users/search?q=testuser&field=username
```

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (banned/inactive account)
- `404` - Not Found (user doesn't exist)
- `409` - Conflict (duplicate email/username)
- `500` - Internal Server Error

## Next Steps

1. **Email Verification**: Add optional email verification on signup
2. **Social Login**: Add Google/Facebook OAuth
3. **Two-Factor Auth**: Add 2FA for enhanced security
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Account Management**: Add change password, update profile endpoints
6. **Admin Dashboard**: User management interface for admins

## Support

For issues or questions:
- Check MongoDB connection
- Verify environment variables
- Check email service configuration
- Review server logs for detailed errors
