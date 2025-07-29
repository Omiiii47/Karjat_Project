// Test script to verify authentication APIs
const testAuth = async () => {
  try {
    // Test registration with a real email
    console.log('Testing registration...');
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@gmail.com', // Use a real domain like gmail.com
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    if (registerData.success) {
      console.log('Registration successful! Now testing login...');
      
      // Test login
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@gmail.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAuth();
