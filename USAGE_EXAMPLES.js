/**
 * Example: How to use the Authentication System
 * Copy this code into your components as needed
 */

// ============================================
// 1. SIGNUP EXAMPLE
// ============================================
const signupUser = async (formData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone // optional
      })
    });

    const data = await response.json();

    if (data.success) {
      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to home or dashboard
      window.location.href = '/villas';
    } else {
      console.error('Signup failed:', data.message);
      // Show error to user
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};

// ============================================
// 2. LOGIN EXAMPLE
// ============================================
const loginUser = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/villas';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};

// ============================================
// 3. LOGOUT EXAMPLE
// ============================================
const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth/login';
};

// ============================================
// 4. CHECK IF USER IS LOGGED IN
// ============================================
const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// ============================================
// 5. PROTECTED API CALL EXAMPLE
// ============================================
const makeProtectedAPICall = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/auth/login';
    return;
  }

  try {
    const response = await fetch('/api/some-protected-route', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      return;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
  }
};

// ============================================
// 6. FORGOT PASSWORD EXAMPLE
// ============================================
const requestPasswordReset = async (email) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      alert('Password reset email sent! Check your inbox.');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// ============================================
// 7. RESET PASSWORD EXAMPLE
// ============================================
const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword })
    });

    const data = await response.json();

    if (data.success) {
      alert('Password reset successful!');
      window.location.href = '/auth/login';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// ============================================
// 8. SEARCH USERS (for /call team)
// ============================================
const searchUsers = async (query, field = 'all') => {
  try {
    const response = await fetch(
      `/api/users/search?q=${encodeURIComponent(query)}&field=${field}`
    );

    const data = await response.json();

    if (data.success) {
      return data.users; // Array of user objects
    } else {
      console.error('Search failed:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// ============================================
// 9. GET USER BY USERNAME (for /call team)
// ============================================
const getUserByUsername = async (username) => {
  try {
    const response = await fetch('/api/users/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await response.json();

    if (data.success) {
      return data.user;
    } else {
      console.error('User not found:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// ============================================
// 10. PROTECTED ROUTE COMPONENT (React)
// ============================================
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return <>{children}</>;
};

// Usage:
// <ProtectedRoute>
//   <YourProtectedComponent />
// </ProtectedRoute>

// ============================================
// 11. USER CONTEXT (React Context API)
// ============================================
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Usage in _app.tsx:
// <UserProvider>
//   <Component {...pageProps} />
// </UserProvider>

// Usage in components:
// const { user, login, logout } = useUser();

// ============================================
// 12. BACKEND: VERIFY TOKEN MIDDLEWARE
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function protectedAPIRoute(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const user = getUserFromToken(authHeader);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated
  console.log('User ID:', user.userId);
  console.log('Username:', user.username);
  console.log('Email:', user.email);
  console.log('Role:', user.role);

  // Your protected logic here
  return NextResponse.json({ success: true, data: 'Protected data' });
}

// ============================================
// 13. CHECK USERNAME AVAILABILITY
// ============================================
const checkUsernameAvailability = async (username) => {
  try {
    const response = await fetch('/api/users/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await response.json();
    
    // If user found, username is taken
    return !data.success;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export {
  signupUser,
  loginUser,
  logoutUser,
  isLoggedIn,
  getCurrentUser,
  makeProtectedAPICall,
  requestPasswordReset,
  resetPassword,
  searchUsers,
  getUserByUsername,
  checkUsernameAvailability,
  ProtectedRoute,
  UserProvider,
  useUser
};
