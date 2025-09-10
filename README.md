# GramHarvest - Instagram Data Collection Extension

A powerful Chrome extension built with React + TypeScript + TailwindCSS for comprehensive Instagram data collection. Extract detailed post information including metadata, engagement metrics, and media links from Instagram profiles.

## Tech Stack

- **React 18** with TypeScript for UI components
- **Vite** for fast development and building
- **TailwindCSS v4** for modern, responsive styling
- **Gulp** for Chrome extension packaging and bundling
- **Chrome Extension Manifest v3** for modern extension architecture
- **Yarn** for dependency management

## Features

### Core Functionality
- **Enhanced Data Collection:** Extract comprehensive post data including:
  - Post URLs (posts and reels)
  - Author information
  - Post captions
  - Like counts
  - Comment counts
  - Creation dates
  - View counts (for videos/reels)
  - Post types (post/reel/story)

### User Experience
- **One-Click Scraping:** Navigate to any Instagram profile and start scraping with a single click
- **Background Operation:** Scraping runs in the background, allowing you to continue browsing
- **Auto-Scroll Control:** Toggle automatic scrolling on/off via checkbox
- **Real-time Updates:** Live progress tracking with immediate status updates
- **Stop & Resume:** Full control over the scraping process

### Export & History
- **Multiple Export Formats:** Download data as JSON, CSV, or Excel (.xlsx)
- **Comprehensive History:** View all past scraping jobs with detailed metadata
- **Data Preview:** Preview collected data before downloading
- **Clear History:** Manage storage with one-click history clearing
- **Instant Results:** History updates immediately after scraping completes

### Interface
- **Modern UI:** Beautiful Instagram-inspired gradient design
- **Version Display:** Current extension version shown in UI
- **Responsive Design:** Optimized for various screen sizes
- **Smooth Animations:** Enhanced user experience with fluid transitions

## Development

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager

### Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd instagram-scrapper
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Build the extension:**
   ```bash
   yarn build && yarn build:extension
   ```

4. **For development with hot reload:**
   ```bash
   yarn dev
   ```

### Available Scripts
- `yarn build` - Build React components with Vite
- `yarn build:extension` - Package extension with Gulp
- `yarn dev` - Start development server
- `yarn lint` - Run TypeScript linting

## Installation

Since this extension is not on the Chrome Web Store, you need to load it manually in Developer Mode.

1. **Build the extension:** Run `yarn build && yarn build:extension` to create the `build` folder
2. **Open Chrome Extensions:** Navigate to `chrome://extensions` in Chrome
3. **Enable Developer Mode:** Toggle the **Developer mode** switch in the top-right corner
4. **Load Unpacked:** Click **"Load unpacked"** and select the `build` folder from this project
5. **Verify Installation:** The "GramHarvest" extension should appear in your extensions list

## How to Use

### Basic Scraping
1. **Login to Instagram:** Ensure you're logged into Instagram in your browser
2. **Navigate to Profile:** Go to any Instagram profile page (e.g., `https://www.instagram.com/instagram/`)
3. **Open Extension:** Click the GramHarvest icon in your browser toolbar
4. **Configure Settings:**
   - Toggle **Auto-scroll** on/off as needed
   - View current extension version
5. **Start Scraping:** Click **"Scrape Current Profile"** button
6. **Monitor Progress:** View real-time updates of collected posts count
7. **Stop if Needed:** Use **"Stop Scraping"** button to halt the process

### Managing Results
1. **View History:** Click **"View History"** to see all past scraping jobs
2. **Preview Data:** Use the **"Preview"** button to examine collected data
3. **Export Options:** Choose from multiple export formats:
   - **JSON:** Complete data with all metadata
   - **CSV:** Spreadsheet-compatible format
   - **Excel:** .xlsx format for Excel compatibility
4. **Clear History:** Use **"Clear History"** to manage storage space

### Advanced Features
- **Auto-scroll Control:** Disable auto-scroll to scrape only visible content
- **Background Operation:** Close popup while scraping continues
- **Real-time Updates:** See progress updates without refreshing
- **Comprehensive Data:** Extract author, captions, engagement metrics, and timestamps

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

This extension was coded with the help of Cascade, a powerful agentic AI coding assistant from Windsurf, powered by Google's Gemini Pro models. ❤️
