/**
 * Setup Script for Authentication System
 * Run this to verify your environment is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Authentication System Setup Check\n');
console.log('='.repeat(50));

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);

console.log('\n1. Environment File (.env.local)');
if (envExists) {
  console.log('   ✅ .env.local exists');
  
  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'ADMIN_MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
    'JWT_SECRET',
    'NEXTAUTH_URL'
  ];
  
  console.log('\n2. Required Environment Variables:');
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    const isEmpty = envContent.includes(`${varName}=\n`) || 
                    envContent.includes(`${varName}= \n`) ||
                    envContent.includes(`${varName}=""`) ||
                    !envContent.includes(`${varName}=`);
    
    if (hasVar && !isEmpty) {
      console.log(`   ✅ ${varName} is set`);
    } else if (hasVar && isEmpty) {
      console.log(`   ⚠️  ${varName} exists but is empty`);
    } else {
      console.log(`   ❌ ${varName} is missing`);
    }
  });
} else {
  console.log('   ❌ .env.local not found');
  console.log('\n   Create .env.local with these variables:');
  console.log(`
# MongoDB
ADMIN_MONGODB_URI=mongodb://localhost:27017/solscape

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@solscape.com

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-key-min-32-chars

# Base URL
NEXTAUTH_URL=http://localhost:3000
  `);
}

console.log('\n3. Dependencies Check:');
const packageJson = require('../package.json');
const requiredDeps = ['bcryptjs', 'jsonwebtoken', 'nodemailer', 'mongoose'];
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep} installed`);
  } else {
    console.log(`   ❌ ${dep} not installed`);
  }
});

console.log('\n4. File Structure Check:');
const requiredFiles = [
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/forgot-password/route.ts',
  'src/app/api/auth/reset-password/route.ts',
  'src/app/auth/signup/page.tsx',
  'src/app/auth/login/page.tsx',
  'src/app/auth/forgot-password/page.tsx',
  'src/app/auth/reset-password/page.tsx',
  'src/lib/auth.ts',
  'src/lib/email.ts',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
  }
});

console.log('\n5. Next Steps:');
console.log('   1. Configure .env.local with real values');
console.log('   2. Set up Gmail App Password:');
console.log('      - Go to Google Account → Security');
console.log('      - Enable 2-Step Verification');
console.log('      - Create App Password for "Mail"');
console.log('   3. Start MongoDB (if not running)');
console.log('   4. Run: npm run dev');
console.log('   5. Visit: http://localhost:3000/auth/signup');
console.log('   6. Test user count: node scripts/count-users.js');

console.log('\n' + '='.repeat(50));
console.log('📚 Documentation:');
console.log('   - AUTH_SYSTEM.md - Complete API documentation');
console.log('   - AUTH_IMPLEMENTATION.md - Implementation summary');
console.log('\n✨ Setup check complete!\n');
