# TypeScript Types Reference

## Core Type Definitions

All TypeScript interfaces and types are defined in `src/types/index.ts`.

### ScrapingState
```typescript
interface ScrapingState {
  isScraping: boolean;        // Current scraping status
  message: string;            // Status message for UI
  count: number;              // Number of posts collected
  currentTabId: number | null; // Active Chrome tab ID
  currentUsername: string | null; // Target Instagram username
  stopScraping: boolean;      // Stop flag for scraping loop
}
```

### PostData
```typescript
interface PostData {
  url: string;           // Direct link to Instagram post/reel
  author: string;        // Username of post creator
  caption: string;       // Full post caption text
  likes: number;         // Number of likes
  comments: number;      // Number of comments
  createdAt: string;     // ISO timestamp of post creation
  views?: number;        // View count (optional, for videos)
  type: 'post' | 'reel' | 'story'; // Content type classification
}
```

### HistoryItem
```typescript
interface HistoryItem {
  id: number;            // Unique identifier (timestamp)
  date: string;          // ISO timestamp of scraping session
  username: string;      // Instagram username that was scraped
  count: number;         // Total number of posts collected
  links: string[];       // Array of post URLs (legacy support)
  posts: PostData[];     // Array of enhanced post data
}
```

### ScrapeResult
```typescript
interface ScrapeResult {
  links: string[];       // URLs found in current scrape iteration
  posts: PostData[];     // Enhanced post data from current iteration
  endOfPage: boolean;    // Flag indicating if page end was reached
}
```

### ChromeMessage
```typescript
interface ChromeMessage {
  command: string;       // Message type identifier
  tabId?: number;        // Chrome tab ID (optional)
  historyId?: number;    // History item ID (optional)
  format?: ExportFormat; // Export format (optional)
  filename?: string;     // Export filename (optional)
  settings?: ScrapingSettings; // User settings (optional)
  state?: ScrapingState; // Current state (optional)
  history?: HistoryItem[]; // History data (optional)
}
```

### ScrapingSettings
```typescript
interface ScrapingSettings {
  autoScroll: boolean;   // Enable/disable automatic scrolling
}
```

### ExportFormat
```typescript
type ExportFormat = 'json' | 'csv' | 'excel';
```

## Message Types

### Command Messages
- `start-scraping` - Initiate scraping process
- `stop-scraping` - Stop current scraping operation
- `get-status` - Request current scraping status
- `download-history` - Download specific history item
- `download-partial` - Download partial scraping results
- `export-data` - Export data in specified format
- `clear-history` - Clear all scraping history
- `update-settings` - Update user preferences

### Status Messages
- `status-update` - Broadcast current scraping state
- `history-update` - Broadcast updated history data

## Type Guards and Validation

### PostData Validation
```typescript
function isValidPostData(data: any): data is PostData {
  return (
    typeof data.url === 'string' &&
    typeof data.author === 'string' &&
    typeof data.caption === 'string' &&
    typeof data.likes === 'number' &&
    typeof data.comments === 'number' &&
    typeof data.createdAt === 'string' &&
    ['post', 'reel', 'story'].includes(data.type)
  );
}
```

### HistoryItem Validation
```typescript
function isValidHistoryItem(item: any): item is HistoryItem {
  return (
    typeof item.id === 'number' &&
    typeof item.date === 'string' &&
    typeof item.username === 'string' &&
    typeof item.count === 'number' &&
    Array.isArray(item.links) &&
    Array.isArray(item.posts)
  );
}
```

## Chrome Extension Types

### Tab Information
```typescript
interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
}
```

### Storage Data
```typescript
interface StorageData {
  scrapingHistory?: HistoryItem[];
  scrapingSettings?: ScrapingSettings;
}
```

### Download Options
```typescript
interface DownloadOptions {
  url: string;
  filename?: string;
  saveAs?: boolean;
}
```

## React Component Props

### PopupApp Props
```typescript
interface PopupAppProps {
  // No props - uses Chrome messaging for state
}
```

### HistoryApp Props
```typescript
interface HistoryAppProps {
  // No props - manages internal state and Chrome storage
}
```

## State Management Types

### Component State
```typescript
// Popup component state
interface PopupState {
  state: ScrapingState;
  autoScroll: boolean;
  version: string;
}

// History component state
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

### Event Handlers
```typescript
type EventHandler<T = void> = () => T;
type ParameterizedEventHandler<P, T = void> = (param: P) => T;

// Common event handler types
type ClickHandler = EventHandler<void>;
type ChangeHandler = ParameterizedEventHandler<boolean, void>;
type ExportHandler = ParameterizedEventHandler<{type: ExportFormat, filename: string}, void>;
```

## Utility Types

### Partial Updates
```typescript
type PartialScrapingState = Partial<ScrapingState>;
type PartialScrapingSettings = Partial<ScrapingSettings>;
```

### Array Element Types
```typescript
type HistoryItemElement = HistoryItem;
type PostDataElement = PostData;
type LinkElement = string;
```

### Function Types
```typescript
type ScrapingFunction = (autoScroll: boolean) => Promise<ScrapeResult>;
type ExportFunction = (historyId: number, format: ExportFormat, filename: string) => Promise<void>;
type StorageFunction<T> = (key: string, value: T) => Promise<void>;
```

## Type Extensions

### Enhanced PostData (Future)
```typescript
interface EnhancedPostData extends PostData {
  hashtags?: string[];      // Extracted hashtags
  mentions?: string[];      // User mentions
  location?: string;        // Geolocation data
  mediaType?: 'image' | 'video' | 'carousel'; // Media classification
  engagement?: number;      // Calculated engagement rate
}
```

### Advanced HistoryItem (Future)
```typescript
interface AdvancedHistoryItem extends HistoryItem {
  tags?: string[];          // User-defined tags
  notes?: string;           // User notes
  exported?: ExportFormat[]; // Track export history
  lastAccessed?: string;    // Last access timestamp
}
```

## Type Safety Best Practices

### Strict Typing
- Always use explicit types for function parameters
- Avoid `any` type except for DOM element casting
- Use type guards for runtime validation
- Implement proper error handling with typed exceptions

### Generic Types
```typescript
// Generic storage function
function setStorageItem<T>(key: string, value: T): Promise<void> {
  return chrome.storage.local.set({ [key]: value });
}

// Generic message handler
function handleMessage<T extends ChromeMessage>(
  message: T,
  handler: (msg: T) => void
): void {
  handler(message);
}
```

### Null Safety
```typescript
// Safe property access
const username = tab?.url?.split('instagram.com/')[1]?.split('/')[0] || 'unknown';

// Optional chaining with fallbacks
const likes = parseInt(likesElement?.textContent?.replace(/[^\d]/g, '') || '0') || 0;
```
