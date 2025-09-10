# Development Guide

## Development Environment Setup

### Prerequisites
- **Node.js**: Version 16 or higher
- **Yarn**: Package manager (preferred over npm)
- **Chrome Browser**: For extension testing
- **Git**: Version control
- **VS Code**: Recommended IDE with TypeScript support

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd gramharvest

# Install dependencies
yarn install

# Build the project
yarn build && yarn build:extension
```

## Project Structure

```
gramharvest/
├── src/
│   ├── background/
│   │   └── background.ts          # Service worker
│   ├── popup/
│   │   ├── PopupApp.tsx          # Main popup component
│   │   ├── popup.tsx             # Popup entry point
│   │   └── index.html            # Popup HTML
│   ├── history/
│   │   ├── HistoryApp.tsx        # History page component
│   │   ├── history.tsx           # History entry point
│   │   └── index.html            # History HTML
│   ├── styles/
│   │   └── globals.css           # Global styles
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── icons/                    # Extension icons
│   └── manifest.json             # Extension manifest
├── docs/                         # Documentation
├── build/                        # Built extension (generated)
├── dist/                         # Vite build output (generated)
├── gulpfile.ts                   # Build configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # TailwindCSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies
```

## Development Workflow

### 1. Development Server
```bash
# Start Vite development server (for UI development)
yarn dev
```

### 2. Build Process
```bash
# Build React components
yarn build

# Package extension
yarn build:extension

# Combined build
yarn build && yarn build:extension
```

### 3. Extension Loading
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `build` folder
4. Extension will appear in toolbar

### 4. Development Testing
- Make code changes
- Run build commands
- Click extension reload button in Chrome
- Test functionality on Instagram

## Code Style and Standards

### TypeScript Configuration
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
  }
}
```

### Linting Rules
- Strict TypeScript mode enabled
- No unused variables or parameters
- Explicit return types for functions
- Consistent import/export patterns

### Code Organization
- **Components**: React functional components with hooks
- **Types**: Centralized in `src/types/index.ts`
- **Styles**: TailwindCSS utility classes
- **Logic**: Business logic in background service worker

## Build System

### Vite Configuration
```typescript
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

### Gulp Tasks
```typescript
// Build React components
gulp.task('buildReact', () => {
  return exec('yarn build');
});

// Copy manifest and assets
gulp.task('copyManifest', () => {
  return gulp.src('src/manifest.json').pipe(gulp.dest('build'));
});

// Copy built files to extension directory
gulp.task('copyBuiltFiles', () => {
  return gulp.src('dist/**/*').pipe(gulp.dest('build'));
});
```

## Debugging

### Chrome DevTools
- **Background Script**: `chrome://extensions` → Inspect views: service worker
- **Popup**: Right-click extension icon → Inspect popup
- **Content Script**: F12 on Instagram page → Console tab

### Console Logging
```typescript
// Background script debugging
console.log('Scraping started for:', username);

// Content script debugging
console.log('Found posts:', posts.length);

// Error handling
console.error('Scraping error:', error);
```

### Extension Debugging
- Monitor Chrome extension logs
- Use Chrome storage inspector
- Test with different Instagram profiles
- Verify permissions and manifest

## Testing Strategy

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Popup displays correctly
- [ ] Scraping starts and stops properly
- [ ] Auto-scroll toggle works
- [ ] History page loads and displays data
- [ ] Export functions work for all formats
- [ ] Clear history functionality works

### Test Profiles
Use these Instagram profiles for testing:
- `@instagram` - Official Instagram account
- `@natgeo` - High-volume content
- `@nike` - Mixed content types
- Small personal accounts for edge cases

### Error Scenarios
- Network disconnection during scraping
- Instagram login required
- Rate limiting responses
- Large profiles (1000+ posts)
- Empty profiles

## Performance Optimization

### Memory Management
```typescript
// Clear large arrays after use
currentLinks.clear();
currentPosts.length = 0;

// Use efficient data structures
const uniqueUrls = new Set<string>();

// Avoid memory leaks in event listeners
chrome.runtime.onMessage.removeListener(handler);
```

### DOM Optimization
```typescript
// Efficient DOM queries
const articles = document.querySelectorAll('article');

// Batch DOM operations
const fragment = document.createDocumentFragment();

// Throttle scroll operations
await new Promise(resolve => setTimeout(resolve, 1000));
```

## Chrome Extension Best Practices

### Manifest V3 Compliance
- Use service workers instead of background pages
- Implement proper permission requests
- Handle service worker lifecycle events
- Use chrome.action API for popup

### Security Considerations
- Content Security Policy compliance
- No eval() or inline scripts
- Secure message passing between components
- Validate all user inputs

### User Experience
- Provide clear loading states
- Handle errors gracefully
- Maintain responsive UI
- Preserve user settings

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version and dependencies
2. **Extension Not Loading**: Verify manifest.json syntax
3. **Scraping Not Working**: Check Instagram DOM changes
4. **Export Errors**: Verify data structure and file permissions

### Debug Commands
```bash
# Check TypeScript compilation
yarn tsc --noEmit

# Verify build output
ls -la build/

# Check extension manifest
cat build/manifest.json

# Monitor build process
yarn build --verbose
```

## Contributing Guidelines

### Code Review Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback

### Commit Message Format
```
type(scope): description

feat(scraping): add enhanced metadata collection
fix(export): resolve CSV formatting issues
docs(readme): update installation instructions
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
