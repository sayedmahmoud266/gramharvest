# Changelog

All notable changes to GramHarvest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-dev.1] - 2025-09-10

### Added
- **Enhanced Data Collection**: Comprehensive post metadata extraction
  - Author information
  - Post captions
  - Like and comment counts
  - Creation timestamps
  - View counts for videos/reels
  - Post type classification (post/reel/story)
- **Multiple Export Formats**: JSON, CSV, and Excel (.xlsx) support
- **Auto-scroll Control**: Toggle automatic scrolling on/off
- **Real-time Updates**: Live progress tracking and status updates
- **Data Preview**: Modal to preview collected data before export
- **Clear History**: One-click history management
- **Version Display**: Extension version shown in UI
- **Modern UI**: Instagram-inspired gradient design
- **Background Operation**: Scraping continues when popup is closed
- **Immediate History Updates**: Results appear instantly after scraping

### Changed
- **Extension Name**: Rebranded from "Instagram Profile Scraper" to "GramHarvest"
- **Data Structure**: Enhanced with comprehensive PostData interface
- **Export System**: Switched to data URLs for service worker compatibility
- **UI Design**: Updated with modern gradient styling and improved layout
- **Build Process**: Enhanced with TypeScript compilation and Gulp packaging

### Fixed
- **TypeScript Errors**: Resolved all compilation and linting issues
- **Auto-scroll Functionality**: Now properly respects checkbox state
- **Excel Export**: Uses correct .xlsx extension
- **History Display**: Items appear immediately after scraping completion
- **Memory Management**: Proper cleanup of temporary data
- **Error Handling**: Graceful degradation for failed data extraction

### Technical
- **Architecture**: Manifest V3 compliance with service worker
- **Type Safety**: Comprehensive TypeScript type definitions
- **Performance**: Optimized DOM queries and memory usage
- **Security**: Content Security Policy compliance
- **Compatibility**: Backward compatibility with legacy data formats

## [0.1.0] - Initial Development

### Added
- Basic Instagram profile scraping
- Simple link collection
- JSON export functionality
- Chrome extension infrastructure
- React + TypeScript frontend
- Basic popup and history interfaces

### Technical Details
- Initial Chrome extension setup
- Vite build configuration
- TailwindCSS integration
- Basic DOM scraping logic
- Chrome storage implementation
