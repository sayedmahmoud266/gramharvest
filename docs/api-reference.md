# API Reference

## Background Service Worker API

### Core Functions

#### `startScraping(tabId: number): Promise<void>`
Initiates the scraping process for the specified Chrome tab.

**Parameters:**
- `tabId` - Chrome tab identifier containing Instagram profile

**Behavior:**
- Resets scraping state and clears previous data
- Retrieves auto-scroll settings from storage
- Executes scraping loop until completion or manual stop
- Saves results to history upon completion

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
Content script function injected into Instagram pages for data extraction.

**Parameters:**
- `autoScroll` - Whether to automatically scroll the page

**Returns:**
- `ScrapeResult` object containing links, posts, and end-of-page status

**DOM Selectors Used:**
```typescript
// Post containers
document.querySelectorAll('article')

// Post links
article.querySelector('a[href*="/p/"], a[href*="/reel/"]')

// Metadata elements
article.querySelector('a[role="link"] span, header a span') // Author
article.querySelector('[data-testid="post-caption"] span') // Caption
article.querySelector('[data-testid="like-count"]') // Likes
article.querySelector('[data-testid="comments-count"]') // Comments
article.querySelector('time') // Timestamp
article.querySelector('[data-testid="video-view-count"]') // Views
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
Processes export requests and generates downloadable files.

**Supported Formats:**
- `json` - Complete data with metadata
- `csv` - Comma-separated values
- `excel` - Tab-separated with .xlsx extension

**Export Process:**
1. Retrieve history item by ID
2. Format data according to requested type
3. Create data URL for download
4. Trigger Chrome download API

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

## React Components API

### PopupApp Component

#### State Management
```typescript
interface PopupState {
  state: ScrapingState;
  autoScroll: boolean;
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
