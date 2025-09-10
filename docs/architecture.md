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
  - Auto-scroll toggle control (dual scraping modes)
  - Navigation to history page
  - InfoSection integration for user information
  - Compact design with 360px max-height constraint

### 4. History Application (`HistoryApp.tsx`)
- **Purpose**: Data management and export interface
- **Responsibilities**:
  - Display scraping history with thumbnail previews
  - Data preview functionality with enhanced metadata
  - Export in multiple formats (JSON, CSV, XLSX)
  - Default export format selection with persistence
  - History management (clear, delete)
  - InfoSection integration for comprehensive user information

### 5. InfoSection Component (`InfoSection.tsx`)
- **Purpose**: Comprehensive user information and legal compliance
- **Responsibilities**:
  - Privacy policy with collapsible interface
  - License agreement and disclaimer
  - GitHub integration (stars badge, issue reporting)
  - Support options (Buy Me a Coffee)
  - Developer attribution and contact information

## Data Flow

### Scraping Process
1. **Initiation**: User clicks "Scrape" in popup
2. **Mode Selection**: Auto-scroll or manual scroll mode based on settings
3. **Command**: Popup sends `start-scraping` message to background
4. **Execution**: Background injects appropriate scraping script into active tab
5. **Collection**: 
   - **Auto-scroll**: Continuous scrolling with content loading detection
   - **Manual scroll**: Debounced scroll event listener for user-controlled scraping
6. **Processing**: Background processes and stores enhanced data with thumbnails
7. **Updates**: Real-time status updates sent to UI components
8. **Completion**: Results saved to history with comprehensive metadata

### Export Process
1. **Format Selection**: User selects from JSON, CSV, or XLSX formats
2. **Default Persistence**: Export format preference saved to Chrome storage
3. **Request**: History app sends `export-data` message to background
4. **Processing**: Background formats data with enhanced handling:
   - **JSON**: Complete structured data with all metadata
   - **CSV**: Multi-line caption support and proper escaping
   - **XLSX**: Modern Excel format with structured worksheets
5. **Download**: Chrome downloads API triggers file download with proper MIME types

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
- **scrapingHistory**: Array of HistoryItem objects with enhanced metadata
- **scrapingSettings**: User preferences (auto-scroll mode selection)
- **defaultExportFormat**: Persistent export format preference
- **Enhanced Data Fields**: thumbnailUrl, pageType, multi-line captions

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
- **Dual Mode Operations**:
  - Auto-scroll: 1-second intervals with content loading detection
  - Manual scroll: 500ms debounced scroll event handling
- Duplicate detection using Set data structures and URL comparison
- Smart end-of-page detection with position and height analysis
- Enhanced DOM element extraction with multiple fallback strategies
- Robust error handling with graceful degradation
- Smart number parsing for engagement metrics (K, M, B format)

### Memory Management
- Cleanup of temporary data after operations
- Efficient data structures for large datasets
- Garbage collection friendly patterns

## UI Architecture

### Component Structure
```
┌─────────────────────────────────────────┐
│                PopupApp                 │
├─────────────────────────────────────────┤
│  Header (Logo, Version)                 │
│  Scraping Controls                      │
│  Settings (Auto-scroll Toggle)          │
│  Navigation (View History)              │
│  InfoSection (Privacy, License, etc.)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│               HistoryApp                │
├─────────────────────────────────────────┤
│  Header (Title, Export Format)          │
│  History List (Thumbnails, Metadata)    │
│  Export Modal (Format Selection)        │
│  InfoSection (Comprehensive Info)       │
└─────────────────────────────────────────┘
```

### Design Principles
- **Instagram-inspired Gradient**: Consistent visual branding
- **Backdrop Blur Effects**: Modern glass-morphism design
- **Responsive Layout**: Optimized for various screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized rendering and state management

## Extension Manifest

### Manifest V3 Compliance
- Service worker instead of background pages
- Declarative permissions model
- Content Security Policy compliance
- Modern Chrome extension standards
- Enhanced security with minimal permissions
