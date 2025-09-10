# Architecture Overview

## System Architecture

GramHarvest follows a modern Chrome extension architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content Script │    │  Background     │    │   Popup/History │
│   (Instagram)    │◄──►│  Service Worker │◄──►│   React Apps    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOM Scraping   │    │  State Mgmt &   │    │   User Interface│
│   Data Extract   │    │  Chrome APIs    │    │   & Controls    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Background Service Worker (`background.ts`)
- **Purpose**: Central coordinator and state manager
- **Responsibilities**:
  - Manages scraping state and lifecycle
  - Handles Chrome extension APIs
  - Coordinates between content scripts and UI
  - Manages data storage and export
  - Processes user commands from popup/history

### 2. Content Script (`scrapeAndScroll` function)
- **Purpose**: Executes on Instagram pages for data extraction
- **Responsibilities**:
  - DOM manipulation and data scraping
  - Auto-scroll functionality
  - Post detection and metadata extraction
  - Returns structured data to background script

### 3. Popup Application (`PopupApp.tsx`)
- **Purpose**: Primary user interface for extension control
- **Responsibilities**:
  - Start/stop scraping operations
  - Display real-time progress
  - Auto-scroll toggle control
  - Navigation to history page

### 4. History Application (`HistoryApp.tsx`)
- **Purpose**: Data management and export interface
- **Responsibilities**:
  - Display scraping history
  - Data preview functionality
  - Export in multiple formats
  - History management (clear, delete)

## Data Flow

### Scraping Process
1. **Initiation**: User clicks "Scrape" in popup
2. **Command**: Popup sends `start-scraping` message to background
3. **Execution**: Background injects content script into active tab
4. **Collection**: Content script extracts data and returns results
5. **Processing**: Background processes and stores data
6. **Updates**: Real-time status updates sent to UI components
7. **Completion**: Results saved to history and user notified

### Export Process
1. **Selection**: User selects export format in history page
2. **Request**: History app sends `export-data` message to background
3. **Processing**: Background formats data according to selected type
4. **Download**: Chrome downloads API triggers file download

## State Management

### Background State
```typescript
interface ScrapingState {
  isScraping: boolean;
  message: string;
  count: number;
  currentTabId: number | null;
  currentUsername: string | null;
  stopScraping: boolean;
}
```

### Storage Structure
- **Chrome Local Storage**: Persistent data storage
- **scrapingHistory**: Array of HistoryItem objects
- **scrapingSettings**: User preferences (auto-scroll, etc.)

## Communication Patterns

### Message Passing
- **Popup ↔ Background**: Command/response pattern
- **History ↔ Background**: Data requests and updates
- **Background → UI**: Status broadcasts

### Event Handling
- Chrome runtime messages for inter-component communication
- Storage change listeners for real-time updates
- Download API for file operations

## Security Considerations

### Permissions
- `activeTab`: Access to current Instagram tab
- `storage`: Local data persistence
- `downloads`: File export functionality
- `scripting`: Content script injection

### Data Privacy
- All data stored locally in browser
- No external API calls or data transmission
- User controls data retention via history management

## Performance Optimizations

### Efficient Scraping
- Throttled scroll operations (1-second intervals)
- Duplicate detection using Set data structures
- Lazy loading of DOM elements
- Error handling for failed extractions

### Memory Management
- Cleanup of temporary data after operations
- Efficient data structures for large datasets
- Garbage collection friendly patterns

## Extension Manifest

### Manifest V3 Compliance
- Service worker instead of background pages
- Declarative permissions model
- Content Security Policy compliance
- Modern Chrome extension standards
