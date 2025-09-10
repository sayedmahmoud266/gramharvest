# Build System

## Overview

GramHarvest uses a dual-build system combining Vite for React compilation and Gulp for Chrome extension packaging.

## Build Architecture

```
Source Code (src/) 
       ↓
   Vite Build (yarn build)
       ↓
   Compiled Assets (dist/)
       ↓
   Gulp Packaging (yarn build:extension)
       ↓
   Extension Package (extension/)
```

## Vite Configuration

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        history: resolve(__dirname, 'src/history/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
```

### Build Targets
- **popup.js**: Popup interface React app
- **history.js**: History page React app  
- **background.js**: Service worker script
- **globals.js**: Shared React components and utilities
- **globals.css**: Compiled TailwindCSS styles

### Output Structure
```
dist/
├── popup.js
├── history.js
├── background.js
├── globals.js
├── globals.css
├── src/
│   ├── popup/
│   │   └── index.html
│   └── history/
│       └── index.html
```

## Gulp Configuration

### `gulpfile.ts`
```typescript
import gulp from 'gulp';
import { exec } from 'child_process';

// Build React components with Vite
gulp.task('buildReact', (done) => {
  exec('yarn build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error}`);
      return done(error);
    }
    console.log(stdout);
    done();
  });
});

// Copy manifest.json
gulp.task('copyManifest', () => {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('build'));
});

// Copy extension icons
gulp.task('copyIcons', () => {
  return gulp.src('src/icons/**/*')
    .pipe(gulp.dest('build/icons'));
});

// Copy compiled files from dist to build
gulp.task('copyBuiltFiles', () => {
  return gulp.src('dist/**/*')
    .pipe(gulp.dest('build'));
});

// Main build task
gulp.task('build', gulp.series(
  'buildReact',
  gulp.parallel('copyManifest', 'copyIcons'),
  'copyBuiltFiles'
));

// Default task
gulp.task('default', gulp.series('build'));
```

### Gulp Tasks
- **buildReact**: Compiles React components with Vite
- **copyManifest**: Copies manifest.json to build directory
- **copyIcons**: Copies extension icons
- **copyBuiltFiles**: Moves Vite output to final build directory
- **build**: Complete build process
- **default**: Alias for build task

## Package.json Scripts

### Available Commands
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:extension": "gulp build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  }
}
```

### Script Descriptions
- **dev**: Start Vite development server
- **build**: TypeScript compilation + Vite build
- **build:extension**: Complete extension packaging
- **preview**: Preview Vite build output
- **lint**: TypeScript type checking

## TypeScript Configuration

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "gulpfile.ts"]
}
```

## TailwindCSS Configuration

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          purple: '#833ab4',
          pink: '#fd1d1d', 
          orange: '#fcb045'
        }
      }
    },
  },
  plugins: [],
}
```

### CSS Processing
- **Input**: `src/styles/globals.css`
- **Processing**: TailwindCSS compilation via Vite
- **Output**: `dist/globals.css`
- **Features**: Custom Instagram gradient colors, utility classes

## Build Process Flow

### Development Workflow
1. **Start Development**: `yarn dev`
2. **Make Changes**: Edit source files
3. **Hot Reload**: Vite automatically recompiles
4. **Test Changes**: Reload extension in Chrome

### Production Build
1. **TypeScript Check**: `tsc --noEmit`
2. **React Build**: `vite build`
3. **Extension Package**: `gulp build`
4. **Output**: Complete extension in `build/` directory

### Complete Build Command
```bash
yarn build && yarn build:extension
```

## File Processing

### HTML Files
- **Source**: `src/popup/index.html`, `src/history/index.html`
- **Processing**: Vite HTML processing with asset injection
- **Output**: `build/src/popup/index.html`, `build/src/history/index.html`

### TypeScript/React Files
- **Source**: `src/**/*.{ts,tsx}`
- **Processing**: TypeScript compilation + React JSX transformation
- **Bundling**: Rollup via Vite
- **Output**: `build/*.js`

### CSS Files
- **Source**: `src/styles/globals.css`
- **Processing**: TailwindCSS compilation + PostCSS
- **Output**: `build/globals.css`

### Static Assets
- **Manifest**: `src/manifest.json` → `build/manifest.json`
- **Icons**: `src/icons/**/*` → `build/icons/**/*`

## Build Optimization

### Code Splitting
- Separate bundles for popup, history, and background
- Shared code in globals.js
- Minimal bundle sizes for extension performance

### Asset Optimization
- CSS minification via Vite
- JavaScript minification via Rollup
- Icon optimization for different sizes

### Development Features
- Source maps for debugging
- Hot module replacement in development
- Fast rebuild times with Vite

## Build Validation

### Pre-build Checks
```bash
# TypeScript validation
yarn tsc --noEmit

# Dependency check
yarn install --check-files

# Lint check (if configured)
yarn lint
```

### Post-build Validation
```bash
# Verify build output
ls -la build/

# Check manifest syntax
cat build/manifest.json | jq .

# Verify file sizes
du -h build/*
```

## Troubleshooting Build Issues

### Common Problems
1. **TypeScript Errors**: Run `yarn tsc --noEmit` to identify issues
2. **Missing Dependencies**: Run `yarn install` to update packages
3. **Vite Build Failures**: Check for syntax errors in source files
4. **Gulp Task Failures**: Verify file paths and permissions

### Build Warnings
- **ts-node/register warnings**: Normal, build continues successfully
- **Unused dependencies**: Can be safely ignored for extension builds
- **Large bundle warnings**: Monitor for performance impact

### Clean Build
```bash
# Remove build artifacts
rm -rf dist/ build/

# Clean dependencies
rm -rf node_modules/
yarn install

# Fresh build
yarn build && yarn build:extension
```

## Performance Metrics

### Typical Build Times
- **Vite Build**: 1-3 seconds
- **Gulp Package**: 1-2 seconds
- **Total**: 3-5 seconds
- **Clean Build**: 5-10 seconds

### Bundle Sizes
- **popup.js**: ~5KB
- **history.js**: ~11KB  
- **background.js**: ~5KB
- **globals.js**: ~140KB (React + dependencies)
- **globals.css**: ~19KB (TailwindCSS)

### Optimization Targets
- Keep individual bundles under 50KB
- Minimize globals.js through tree shaking
- Optimize CSS for unused classes removal
