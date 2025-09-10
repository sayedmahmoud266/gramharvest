# API Reference

## Background Service Worker API

### Core Functions

#### `startScraping(tabId: number): Promise<void>`
Initiates the scraping process for the specified Chrome tab with dual mode support.

**Parameters:**
- `tabId` - Chrome tab identifier containing Instagram profile

**Behavior:**
- Resets scraping state and clears previous data
- Retrieves auto-scroll settings from storage
- **Auto-scroll Mode**: Continuous scrolling with content loading detection
- **Manual Scroll Mode**: Sets up debounced scroll event listener
- Executes scraping loop until completion or manual stop
- Saves results to history with enhanced metadata upon completion

**Example:**
```typescript
await startScraping(123456);
```

#### `stopScraping(): void`
Stops the current scraping operation.

**Behavior:**
- Sets stop flag to halt scraping loop
- Preserves partial results for potential download
- Updates UI with stopped status

#### `scrapeAndScroll(autoScroll: boolean): Promise<ScrapeResult>`
Content script function injected into Instagram pages for enhanced data extraction.

**Parameters:**
- `autoScroll` - Whether to automatically scroll the page

**Returns:**
- `ScrapeResult` object containing links, posts, and end-of-page status

**Enhanced Features:**
- Smart end-of-page detection with 1.5s content loading wait
- Multi-line caption extraction with proper formatting
- Thumbnail URL extraction from image elements
- Page type detection (main profile vs reels tab)
- Smart number parsing for engagement metrics (K, M, B format)
- Multiple DOM selector fallback strategies

**DOM Selectors Used:**
```typescript
// Post containers
document.querySelectorAll('article')

// Post links
article.querySelector('a[href*="/p/"], a[href*="/reel/"]')

// Enhanced metadata extraction with fallbacks
article.querySelector('a[role="link"] span, header a span') // Author
article.querySelector('[data-testid="post-caption"] span') // Caption
article.querySelector('img') // Thumbnail extraction
article.querySelector('[data-testid="like-count"]') // Likes
article.querySelector('[data-testid="comments-count"]') // Comments
article.querySelector('time') // Timestamp
article.querySelector('[data-testid="video-view-count"]') // Views

// Page type detection
window.location.pathname.includes('/reels/') // Reels tab detection

// Smart number parsing
function parseNumber(text: string): number {
  // Handles K, M, B suffixes (e.g., "1.2K" -> 1200)
}
```

### Storage Functions

#### `saveHistory(username: string, links: string[], posts: PostData[]): Promise<void>`
Saves scraping results to Chrome local storage.

**Parameters:**
- `username` - Instagram username that was scraped
- `links` - Array of post URLs (legacy support)
- `posts` - Array of enhanced post data

**Storage Structure:**
```typescript
{
  scrapingHistory: HistoryItem[]
}
```

#### `handleExportData(message: ChromeMessage): Promise<void>`
Processes export requests and generates downloadable files with enhanced formatting.

**Supported Formats:**
- `json` - Complete structured data with all metadata
- `csv` - Comma-separated values with multi-line caption support
- `excel` - Modern XLSX format with structured worksheets

**Enhanced Export Features:**
- **CSV**: Proper escaping of multi-line captions (line breaks → spaces)
- **XLSX**: Modern Excel format using xlsx library with base64 encoding
- **Default Format Persistence**: User preference saved to Chrome storage
- **Smart Filename Generation**: Username-based naming with proper extensions

**Export Process:**
1. Retrieve history item by ID
2. Apply format-specific data transformations
3. Generate proper MIME types and encoding
4. Create downloadable blob with correct headers
5. Trigger Chrome download API with enhanced metadata

### Message Handlers

#### Chrome Runtime Messages

**`start-scraping`**
```typescript
{
  command: 'start-scraping',
  tabId: number
}
```

**`stop-scraping`**
```typescript
{
  command: 'stop-scraping'
}
```

**`get-status`**
```typescript
{
  command: 'get-status'
}
// Response: ScrapingState object
```

**`export-data`**
```typescript
{
  command: 'export-data',
  historyId: number,
  format: ExportFormat,
  filename: string
}
```

**`clear-history`**
```typescript
{
  command: 'clear-history'
}
```

**`update-settings`**
```typescript
{
  command: 'update-settings',
  settings: ScrapingSettings
}
```

**`manual-scroll-scrape`**
```typescript
{
  command: 'manual-scroll-scrape'
}
// Triggered by debounced scroll events in manual mode
```

**`download-partial`**
```typescript
{
  command: 'download-partial',
  format: ExportFormat,
  filename: string
}
// Download current scraping results before completion
```

## React Components API

### PopupApp Component

#### Enhanced Features
- **Compact Design**: 360px max-height with scrollable overflow
- **Dual Mode Toggle**: Auto-scroll vs manual scroll selection
- **Export Format Integration**: Uses default format for partial downloads
- **InfoSection Integration**: Privacy policy, license, and support information

#### State Management
```typescript
interface PopupState {
  state: ScrapingState;
  settings: { autoScroll: boolean };
  defaultExportFormat: 'json' | 'csv' | 'excel';
  version: string;
}
```

#### Key Methods
- `handleStartScraping()` - Initiates scraping for current tab
- `handleStopScraping()` - Stops active scraping operation
- `handleAutoScrollChange(checked: boolean)` - Updates auto-scroll setting
- `handleViewHistory()` - Opens history page in new tab

#### Chrome API Usage
```typescript
// Get current tab
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// Send message to background
chrome.runtime.sendMessage({ command: 'start-scraping', tabId: tab.id });

// Listen for status updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.command === 'status-update') {
    setState(message.state);
  }
});
```

### HistoryApp Component

#### State Management
```typescript
interface HistoryState {
  history: HistoryItem[];
  loading: boolean;
  showExportModal: boolean;
  showPreview: boolean;
  selectedItem: HistoryItem | null;
  autoScroll: boolean;
  version: string;
}
```

#### Key Methods
- `loadHistory()` - Retrieves history from Chrome storage
- `handleExport(item: HistoryItem, options: ExportOptions)` - Initiates export process
- `handlePreview(item: HistoryItem)` - Shows data preview modal
- `handleClearHistory()` - Clears all history data
- `handleAutoScrollChange(checked: boolean)` - Updates auto-scroll setting

## Chrome Extension APIs

### Permissions Required
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "downloads",
    "scripting"
  ]
}
```

### Storage API Usage
```typescript
// Save data
await chrome.storage.local.set({ key: value });

// Retrieve data
const { key } = await chrome.storage.local.get('key');

// Clear storage
await chrome.storage.local.clear();
```

### Downloads API Usage
```typescript
chrome.downloads.download({
  url: dataUrl,
  filename: 'export.json',
  saveAs: true
});
```

### Scripting API Usage
```typescript
const results = await chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: scrapeAndScroll,
  args: [autoScroll]
});
```

## Data Structures

### PostData
```typescript
interface PostData {
  url: string;           // Instagram post URL
  author: string;        // Post author username
  caption: string;       // Post caption text
  likes: number;         // Like count
  comments: number;      // Comment count
  createdAt: string;     // ISO timestamp
  views?: number;        // View count (optional)
  type: 'post' | 'reel' | 'story'; // Content type
}
```

### HistoryItem
```typescript
interface HistoryItem {
  id: number;            // Unique identifier
  date: string;          // Scraping date (ISO)
  username: string;      // Target username
  count: number;         // Total posts collected
  links: string[];       // Post URLs (legacy)
  posts: PostData[];     // Enhanced post data
}
```

### ScrapeResult
```typescript
interface ScrapeResult {
  links: string[];       // URLs from current iteration
  posts: PostData[];     // Post data from current iteration
  endOfPage: boolean;    // End of page indicator
}
```

### ScrapingState
```typescript
interface ScrapingState {
  isScraping: boolean;        // Active scraping status
  message: string;            // Status message
  count: number;              // Posts collected
  currentTabId: number | null; // Active tab ID
  currentUsername: string | null; // Target username
  stopScraping: boolean;      // Stop flag
}
```

## Error Handling

### Common Error Patterns
```typescript
try {
  // Risky operation
} catch (error) {
  console.error('Operation failed:', error);
  // Graceful degradation
}
```

### Chrome API Error Handling
```typescript
chrome.runtime.sendMessage(message).catch(() => {
  // Handle disconnected port errors
});
```

### DOM Access Error Handling
```typescript
const element = document.querySelector('selector');
if (!element) {
  console.warn('Element not found');
  return fallbackValue;
}
```

## Performance Considerations

### Throttling
```typescript
// Scroll delay to prevent rate limiting
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Memory Management
```typescript
// Clear large data structures
currentLinks.clear();
currentPosts.length = 0;
```

### Efficient DOM Queries
```typescript
// Cache DOM queries
const articles = document.querySelectorAll('article');
articles.forEach(article => {
  // Process each article
});
```

## Security Best Practices

### Input Validation
```typescript
function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '');
}
```

### Safe Property Access
```typescript
const value = element?.textContent?.trim() || 'default';
```

### Content Security Policy
- No inline scripts or eval()
- All resources loaded from extension package
- Secure message passing between components
