# Changelog

All notable changes to GramHarvest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-11

### 🚀 First Stable Release

#### Added
- **Dual Scraping Modes**: 
  - Auto-scroll mode with continuous scrolling and content loading detection
  - Manual scroll mode with debounced scroll event handling
- **Enhanced Data Collection**: 
  - Thumbnail image URLs extraction
  - Smart number parsing for engagement metrics (K, M, B format)
  - Multi-line caption support with proper formatting
  - Page type detection (main profile vs reels tab)
- **Modern Export System**:
  - JSON export with complete metadata
  - CSV export with multi-line caption handling
  - Modern XLSX format using xlsx library with proper Excel compatibility
  - Default export format selection with persistent storage
- **Comprehensive InfoSection**:
  - Privacy policy with transparent data handling explanation
  - License agreement with responsibility disclaimers
  - GitHub integration (stars badge, issue reporting, feature requests)
  - Buy Me a Coffee support integration
  - Developer attribution with contact information
- **Professional UI Enhancements**:
  - GramHarvest logo and branding
  - Tech stack badges (React, TypeScript, Vite, TailwindCSS, Chrome Extension, Yarn)
  - 360px max-height popup with scrollable overflow
  - Instagram-inspired gradient design with backdrop blur effects
- **Demo & Documentation**:
  - Interactive demo GIF showcasing extension capabilities
  - Professional screenshots gallery
  - Comprehensive documentation covering all features
  - Updated architecture diagrams and API reference

#### Enhanced
- **Smart End Detection**: Enhanced algorithms with 1.5s content loading wait
- **Duplicate Prevention**: Robust filtering using URL comparison and Set structures
- **Error Recovery**: Graceful degradation with multiple DOM selector fallback strategies
- **Performance Optimization**: Debounced scroll events and efficient memory management
- **Repository Structure**: Updated from instagram-scrapper to gramharvest branding

#### Technical Improvements
- **Build System**: Enhanced Gulp configuration for extension packaging
- **Type Safety**: Comprehensive TypeScript interfaces and type definitions
- **Code Organization**: Modular component structure with InfoSection separation
- **Documentation**: Complete synchronization between code and documentation
- **Version Management**: Consistent versioning across all components

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
