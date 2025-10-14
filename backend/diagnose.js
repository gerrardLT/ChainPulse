/**
 * Backend Startup Diagnostics
 * Run: node diagnose.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ChainPulse Backend Diagnostics\n');
console.log('=' .repeat(50));

// 1. Check Node version
console.log('\n1️⃣ Node.js Version:');
console.log(`   ${process.version}`);
if (parseInt(process.version.slice(1)) < 20) {
  console.log('   ⚠️  Warning: Node.js 20+ is recommended');
} else {
  console.log('   ✅ Version OK');
}

// 2. Check if .env exists
console.log('\n2️⃣ Environment File (.env):');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'FRONTEND_URL'
    ];
    
    console.log('\n   Required environment variables:');
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        const value = envContent.match(new RegExp(`${varName}=(.+)`))?.[1];
        if (value && value.trim() && !value.includes('your-') && !value.includes('PASSWORD')) {
          console.log(`   ✅ ${varName}`);
        } else {
          console.log(`   ⚠️  ${varName} (needs to be configured)`);
        }
      } else {
        console.log(`   ❌ ${varName} (missing)`);
      }
    });
  } catch (err) {
    console.log(`   ❌ Error reading .env: ${err.message}`);
  }
} else {
  console.log('   ❌ .env file NOT found');
  console.log('   📝 Create one by copying .env.example');
  console.log('   💡 Minimum required variables:');
  console.log('      - PORT=4000');
  console.log('      - DATABASE_URL="postgresql://..."');
  console.log('      - JWT_SECRET="random-secret-string"');
  console.log('      - FRONTEND_URL="http://localhost:3000"');
}

// 3. Check node_modules
console.log('\n3️⃣ Dependencies (node_modules):');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
  
  // Check critical dependencies
  const criticalDeps = [
    'express',
    '@prisma/client',
    'socket.io',
    'dotenv',
    'jsonwebtoken',
    'ethers'
  ];
  
  console.log('\n   Critical dependencies:');
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} (missing)`);
    }
  });
} else {
  console.log('   ❌ node_modules NOT found');
  console.log('   📝 Run: npm install');
}

// 4. Check Prisma Client
console.log('\n4️⃣ Prisma Client:');
const prismaClientPath = path.join(nodeModulesPath, '.prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('   ✅ Prisma Client generated');
} else {
  console.log('   ❌ Prisma Client NOT generated');
  console.log('   📝 Run: npm run prisma:generate');
}

// 5. Check TypeScript files
console.log('\n5️⃣ Source Files:');
const srcPath = path.join(__dirname, 'src');
const indexPath = path.join(srcPath, 'index.ts');
if (fs.existsSync(indexPath)) {
  console.log('   ✅ src/index.ts exists');
} else {
  console.log('   ❌ src/index.ts NOT found');
}

// 6. Check tsconfig
console.log('\n6️⃣ TypeScript Configuration:');
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('   ✅ tsconfig.json exists');
} else {
  console.log('   ❌ tsconfig.json NOT found');
}

// 7. Check package.json scripts
console.log('\n7️⃣ NPM Scripts:');
try {
  const packageJson = require('./package.json');
  if (packageJson.scripts && packageJson.scripts.dev) {
    console.log(`   ✅ dev script: ${packageJson.scripts.dev}`);
  } else {
    console.log('   ❌ dev script NOT found in package.json');
  }
} catch (err) {
  console.log(`   ❌ Error reading package.json: ${err.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📋 Summary and Next Steps:\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ CRITICAL: Create .env file first!');
  console.log('   Copy .env.example or create manually with:');
  console.log('   PORT=4000');
  console.log('   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"');
  console.log('   JWT_SECRET="your-secret-key"');
  console.log('   FRONTEND_URL="http://localhost:3000"\n');
}

if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ CRITICAL: Install dependencies');
  console.log('   Run: npm install\n');
}

if (!fs.existsSync(prismaClientPath)) {
  console.log('⚠️  WARNING: Generate Prisma Client');
  console.log('   Run: npm run prisma:generate\n');
}

console.log('ℹ️  To start the server after fixing issues:');
console.log('   npm run dev\n');

console.log('📚 For more help, see:');
console.log('   - backend/README.md');
console.log('   - docs/系统技术架构.md\n');


