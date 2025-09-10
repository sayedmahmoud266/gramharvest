# Troubleshooting Guide

## Common Issues and Solutions

### Extension Loading Issues

#### Extension Not Appearing in Chrome
**Symptoms**: Extension doesn't show up after loading unpacked
**Causes**: 
- Incorrect folder selected
- Manifest.json errors
- Build not completed

**Solutions**:
1. Verify you selected the `build` folder (not root directory)
2. Check manifest.json syntax: `cat build/manifest.json`
3. Rebuild extension: `yarn build && yarn build:extension`
4. Check Chrome extensions page for error messages

#### Extension Icon Grayed Out
**Symptoms**: Extension icon appears but is disabled/grayed
**Causes**:
- Not on Instagram page
- Permissions not granted
- Service worker crashed

**Solutions**:
1. Navigate to instagram.com
2. Check permissions in chrome://extensions
3. Reload extension in Chrome
4. Inspect service worker for errors

### Scraping Issues

#### No Posts Detected
**Symptoms**: Scraping starts but count remains 0
**Causes**:
- Instagram UI changes
- Login required
- Rate limiting
- DOM selectors outdated

**Solutions**:
1. Ensure logged into Instagram
2. Refresh Instagram page
3. Check browser console for errors
4. Try different Instagram profile
5. Update DOM selectors in background.ts

#### Scraping Stops Immediately
**Symptoms**: Scraping ends after 1-2 seconds
**Causes**:
- End of page detected incorrectly
- JavaScript errors
- Instagram blocking

**Solutions**:
1. Check console for JavaScript errors
2. Disable auto-scroll and try manual scraping
3. Clear browser cache and cookies
4. Try incognito mode
5. Use different Instagram account

#### Incomplete Data Collection
**Symptoms**: URLs collected but metadata missing
**Causes**:
- Instagram layout changes
- Selector mismatches
- Content not fully loaded

**Solutions**:
1. Increase scroll delay in background.ts
2. Update DOM selectors for metadata
3. Check Instagram page source for changes
4. Test with different post types

### Export Issues

#### Download Not Starting
**Symptoms**: Export button clicked but no download
**Causes**:
- Browser popup blocker
- File size too large
- Chrome download restrictions

**Solutions**:
1. Allow popups for extension
2. Check Chrome download settings
3. Try smaller datasets
4. Use different export format

#### Corrupted Export Files
**Symptoms**: Downloaded files won't open or contain errors
**Causes**:
- Character encoding issues
- Special characters in data
- File format problems

**Solutions**:
1. Use JSON export for debugging
2. Check for special characters in captions
3. Try CSV format instead of Excel
4. Verify file encoding (UTF-8)

#### Excel Files Won't Open
**Symptoms**: .xlsx files show format errors
**Causes**:
- Tab-separated format in .xlsx extension
- Excel version compatibility
- File corruption

**Solutions**:
1. Use CSV format for Excel compatibility
2. Import as tab-delimited text in Excel
3. Try opening in Google Sheets
4. Use JSON format and convert manually

### UI Issues

#### Popup Not Displaying Correctly
**Symptoms**: Popup appears blank or malformed
**Causes**:
- CSS not loaded
- React component errors
- Build issues

**Solutions**:
1. Check browser console for errors
2. Rebuild extension: `yarn build && yarn build:extension`
3. Clear browser cache
4. Inspect popup in DevTools

#### History Page Empty
**Symptoms**: History page loads but shows no data
**Causes**:
- No scraping history
- Storage access issues
- Component state problems

**Solutions**:
1. Perform a test scraping first
2. Check Chrome storage in DevTools
3. Clear extension storage and retry
4. Check console for storage errors

#### Auto-scroll Toggle Not Working
**Symptoms**: Checkbox state doesn't affect scraping behavior
**Causes**:
- Settings not persisted
- Message passing issues
- Background script errors

**Solutions**:
1. Check Chrome storage for scrapingSettings
2. Verify message passing in console
3. Reload extension
4. Clear extension data and reconfigure

### Performance Issues

#### Browser Freezing During Scraping
**Symptoms**: Chrome becomes unresponsive
**Causes**:
- Too fast scrolling
- Memory leaks
- Large datasets

**Solutions**:
1. Increase scroll delay in background.ts
2. Limit scraping to smaller profiles
3. Close other browser tabs
4. Restart Chrome

#### Slow Export Processing
**Symptoms**: Export takes very long time
**Causes**:
- Large datasets
- Complex data processing
- Memory constraints

**Solutions**:
1. Export smaller chunks of data
2. Use JSON format for faster processing
3. Close other applications
4. Try different export format

### Development Issues

#### Build Failures
**Symptoms**: `yarn build` or `yarn build:extension` fails
**Causes**:
- TypeScript errors
- Missing dependencies
- Node.js version issues

**Solutions**:
1. Check TypeScript compilation: `yarn tsc --noEmit`
2. Update dependencies: `yarn install`
3. Verify Node.js version (16+)
4. Clear node_modules and reinstall

#### Hot Reload Not Working
**Symptoms**: Changes not reflected during development
**Causes**:
- Vite server issues
- File watching problems
- Cache issues

**Solutions**:
1. Restart development server
2. Clear browser cache
3. Check file permissions
4. Use hard refresh (Ctrl+Shift+R)

## Debugging Techniques

### Chrome DevTools
1. **Service Worker**: chrome://extensions → Inspect views: service worker
2. **Popup**: Right-click extension icon → Inspect popup
3. **Content Script**: F12 on Instagram page → Console
4. **Storage**: Application tab → Storage → Extension storage

### Console Logging
Add debug logs to identify issues:
```typescript
// Background script
console.log('Scraping state:', state);
console.log('Posts collected:', currentPosts.length);

// Content script
console.log('DOM elements found:', articles.length);
console.log('Extracted data:', postData);
```

### Network Monitoring
1. Open DevTools Network tab
2. Monitor requests during scraping
3. Check for failed requests or rate limiting
4. Verify Instagram API responses

### Storage Inspection
```typescript
// Check stored data
chrome.storage.local.get(null, (data) => {
  console.log('All stored data:', data);
});

// Clear storage for testing
chrome.storage.local.clear();
```

## Instagram-Specific Issues

### Login Requirements
**Issue**: Instagram requires login for profile access
**Solution**: 
1. Log into Instagram in the same browser
2. Accept Instagram cookies and terms
3. Verify login status before scraping

### Rate Limiting
**Issue**: Instagram blocks rapid requests
**Solution**:
1. Increase delays between operations
2. Use different Instagram accounts
3. Scrape during off-peak hours
4. Implement exponential backoff

### UI Changes
**Issue**: Instagram updates break selectors
**Solution**:
1. Inspect current Instagram DOM structure
2. Update selectors in background.ts
3. Add fallback selectors
4. Test with multiple profile types

### Content Loading
**Issue**: Dynamic content not fully loaded
**Solution**:
1. Add wait times for content loading
2. Check for loading indicators
3. Implement retry mechanisms
4. Use intersection observers for visibility

## Error Codes and Messages

### Extension Errors
- `Manifest file is missing or unreadable` - Check manifest.json syntax
- `Could not load background script` - Verify background.ts compilation
- `Extension is not enabled` - Enable in chrome://extensions

### Scraping Errors
- `Cannot access Instagram page` - Check permissions and login
- `No posts found` - Verify DOM selectors and page content
- `Scraping timeout` - Increase timeout values or check network

### Export Errors
- `Download failed` - Check browser download permissions
- `File format error` - Verify data structure and encoding
- `Storage quota exceeded` - Clear old history or use external storage

## Getting Help

### Debug Information to Collect
1. Chrome version and OS
2. Extension version
3. Instagram profile URL being scraped
4. Console error messages
5. Network requests (if relevant)
6. Steps to reproduce issue

### Reporting Issues
Include the following in bug reports:
- Detailed description of issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and extension versions
- Console logs and error messages
- Screenshots if UI-related

### Community Resources
- GitHub Issues for bug reports
- Documentation for feature requests
- Development guide for contributions
- Stack Overflow for general questions
