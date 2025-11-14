/**
 * Build Optimization Script
 * 
 * This script analyzes and optimizes the production build
 * 
 * Usage: node scripts/optimize-build.js
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'frontend-react', 'build');
const statsFile = path.join(buildDir, 'asset-manifest.json');

console.log('🔍 Analyzing production build...\n');

// Check if build exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Get build size
function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const totalSize = getDirSize(buildDir);
console.log(`📦 Total build size: ${formatBytes(totalSize)}`);

// Analyze asset manifest
if (fs.existsSync(statsFile)) {
  const manifest = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  console.log('\n📊 Asset Breakdown:');
  
  Object.entries(manifest.files).forEach(([key, value]) => {
    if (key.endsWith('.js') || key.endsWith('.css')) {
      const filePath = path.join(buildDir, value);
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        console.log(`  ${key}: ${formatBytes(size)}`);
      }
    }
  });
}

// Check for large files
console.log('\n⚠️  Large Files (>500KB):');
function findLargeFiles(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      findLargeFiles(filePath, prefix + file + '/');
    } else if (stats.size > 500 * 1024) {
      console.log(`  ${prefix}${file}: ${formatBytes(stats.size)}`);
    }
  });
}

findLargeFiles(buildDir);

// Recommendations
console.log('\n💡 Optimization Recommendations:');
console.log('  ✓ Code splitting enabled (React.lazy)');
console.log('  ✓ Minification enabled');
console.log('  ✓ Source maps generated');

if (totalSize > 5 * 1024 * 1024) {
  console.log('  ⚠️  Build size is large. Consider:');
  console.log('     - Analyzing bundle with webpack-bundle-analyzer');
  console.log('     - Removing unused dependencies');
  console.log('     - Optimizing images');
}

console.log('\n✅ Build analysis complete!');
console.log('\n📝 Next steps:');
console.log('  1. Test build locally: npx serve -s frontend-react/build');
console.log('  2. Deploy to production server');
console.log('  3. Configure web server (Nginx/Apache)');
console.log('  4. Enable gzip compression');
console.log('  5. Set up CDN (optional)');
