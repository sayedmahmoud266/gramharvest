import gulp from 'gulp';
import zip from 'gulp-zip';
import { exec } from 'child_process';
import { promisify } from 'util';

const { src, dest, watch, series, parallel } = gulp;

const execAsync = promisify(exec);

// Build the React app with Vite
async function buildReact() {
  await execAsync('yarn build');
}

// Copy manifest and other static files
function copyManifest() {
  return src('src/manifest.json')
    .pipe(dest('extension'));
}

function copyIcons() {
  return src('src/icons/**/*')
    .pipe(dest('extension/icons'));
}

// Copy built files to extension folder
async function copyBuiltFiles() {
  const fs = await import('fs');
  
  // Copy JS and CSS files
  fs.copyFileSync('dist/background.js', 'extension/background.js');
  fs.copyFileSync('dist/popup.js', 'extension/popup.js');
  fs.copyFileSync('dist/history.js', 'extension/history.js');
  fs.copyFileSync('dist/globals.js', 'extension/globals.js');
  fs.copyFileSync('dist/globals.css', 'extension/globals.css');
  
  // Copy and rename HTML files
  fs.copyFileSync('dist/src/popup/index.html', 'extension/popup.html');
  fs.copyFileSync('dist/src/history/index.html', 'extension/history.html');
}

// Create extension package
function packageExtension() {
  return src('extension/**/*')
    .pipe(zip('instagram-scraper-extension.zip'))
    .pipe(dest('packages'));
}

// Clean and build everything
const build = series(
  buildReact,
  parallel(copyManifest, copyIcons),
  copyBuiltFiles
);

// Watch for changes during development
function watchFiles() {
  watch('src/**/*', build);
}

// Export tasks
export { build, packageExtension, watchFiles as watch };
export default build;
