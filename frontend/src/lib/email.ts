import nodemailer from 'nodemailer';

// Create transporter (you'll need to configure this with your email service)
const transporter = nodemailer.createTransport({
  // For Gmail
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Alternative configuration for other services like SendGrid, Mailgun, etc.
// const transporter = nodemailer.createTransport({
//   host: 'smtp.sendgrid.net',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'apikey',
//     pass: process.env.SENDGRID_API_KEY,
//   },
// });

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationURL = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@solscape.com',
    to: email,
    subject: 'Verify Your Email - Solscape',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Solscape</h1>
          <p style="color: #666; margin: 5px 0;">Luxury Villa Rentals</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome to Solscape!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for signing up for Solscape. To complete your registration and start booking luxury villas, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationURL}" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 6px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin-top: 5px;">
            ${verificationURL}
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with Solscape, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@solscape.com',
    to: email,
    subject: 'Welcome to Solscape!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Solscape</h1>
          <p style="color: #666; margin: 5px 0;">Luxury Villa Rentals</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${firstName}! 🎉</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your email has been successfully verified! You can now enjoy all the features of Solscape:
          </p>
          
          <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
            <li>Browse our collection of luxury villas</li>
            <li>Book your dream vacation</li>
            <li>Manage your trips and bookings</li>
            <li>Access exclusive member offers</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/villas" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 6px; font-weight: 600; display: inline-block;">
              Start Exploring Villas
            </a>
          </div>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Thank you for choosing Solscape for your luxury travel needs!</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
  }
};

// Email validation regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if email domain exists (basic validation)
export const isRealEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1];
  const commonFakeDomains = [
    'test.com',
    'example.com',
    'fake.com',
    'dummy.com',
    'temp.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
  ];
  
  return !commonFakeDomains.includes(domain.toLowerCase());
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetURL = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@solscape.com',
    to: email,
    subject: 'Reset Your Password - Solscape',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Solscape</h1>
          <p style="color: #666; margin: 5px 0;">Luxury Villa Rentals</p>
        </div>
        
        <div style="background: #fef2f2; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password for your Solscape account. 
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 6px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin-top: 5px;">
            ${resetURL}
          </p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            ⚠️ <strong>Security Notice:</strong> This link will expire in 30 minutes for your security.
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Your password will not change unless you click the link above and create a new one.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send password changed confirmation email
export const sendPasswordChangedEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@solscape.com',
    to: email,
    subject: 'Your Password Has Been Changed - Solscape',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Solscape</h1>
          <p style="color: #666; margin: 5px 0;">Luxury Villa Rentals</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #166534; margin-top: 0;">✓ Password Changed Successfully</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            Your Solscape account password has been successfully changed. You can now log in with your new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
               style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 6px; font-weight: 600; display: inline-block;">
              Log In Now
            </a>
          </div>
        </div>
        
        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #991b1b; font-size: 14px; margin: 0;">
            🔒 <strong>Did you make this change?</strong> If you didn't change your password, 
            please contact our support team immediately at support@solscape.com
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This is an automated security notification.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password changed confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending password changed email:', error);
    // Don't throw error as it's not critical
  }
};
