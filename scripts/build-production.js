const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building skiniPROG for production...');

// Build frontend
console.log('📦 Building React frontend...');
execSync('npm run build:client', { stdio: 'inherit' });

// Build backend
console.log('🔧 Compiling TypeScript backend...');
execSync('npx tsc --project server/tsconfig.json', { stdio: 'inherit' });

// Copy static assets
console.log('📋 Copying assets...');
const distDir = path.join(__dirname, '../dist');
const serverDir = path.join(distDir, 'server');

// Ensure directories exist
fs.mkdirSync(serverDir, { recursive: true });

// Copy package.json for production dependencies
fs.copyFileSync(
  path.join(__dirname, '../package.json'),
  path.join(distDir, 'package.json')
);

// Copy attached assets
const assetsDir = path.join(__dirname, '../attached_assets');
const distAssetsDir = path.join(distDir, 'attached_assets');
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, distAssetsDir, { recursive: true });
}

console.log('✅ Production build completed!');
console.log('📁 Build artifacts are in the dist/ directory');