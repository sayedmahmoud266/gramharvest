# Instagram Profile Scraper Extension

This is a simple Chrome extension to scrape all post and reel links from an Instagram profile page.

## Features

- **One-Click Scraping:** Navigate to any Instagram profile and start scraping with a single click.
- **Background Operation:** The scraping process runs in the background, so you can close the popup and continue browsing.
- **Continuous Scrolling:** Automatically scrolls the page to load all posts until it reaches the end.
- **Stop & Resume:** You can stop the scraping process at any time.
- **Download Results:** Download the scraped links as a JSON file.
- **Scraping History:** View a history of all past scraping jobs, with the ability to re-download the results at any time.

## Installation

Since this extension is not on the Chrome Web Store, you need to load it manually in Developer Mode.

1.  **Download or Clone:** Download this repository to your local machine.
2.  **Open Chrome Extensions:** Open your Chrome browser and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** In the top-right corner of the extensions page, turn on the **Developer mode** toggle.
4.  **Load Unpacked:** Click the **"Load unpacked"** button that appears. A file dialog will open.
5.  **Select Folder:** Navigate to the location where you downloaded this repository and select the `extension` folder.

 The "Instagram Scraper" extension should now appear in your list of extensions and be ready to use.

## How to Use

1.  **Log in to Instagram:** Make sure you are logged into your Instagram account in your regular browser.
2.  **Navigate to a Profile:** Go to the Instagram profile page you want to scrape (e.g., `https://www.instagram.com/instagram/`).
3.  **Start Scraping:**
    *   Click the extension's icon in your browser toolbar.
    *   Click the **"Scrape Current Profile"** button.
    *   You can close the popup, and the scraping will continue in the background. You can click the icon again at any time to see the progress.
4.  **Stop Scraping (Optional):** If you want to stop before it finishes, open the popup and click the **"Stop Scraping"** button.
5.  **Download Results:**
    *   After the scrape is finished or stopped, a **"Download Results"** button will appear in the popup. Click it to save the collected links.
    *   The downloaded file will be named in the format `[username]_ig_posts_[timestamp].json`.
6.  **View History:**
    *   Click the **"View History"** button in the popup.
    *   A new tab will open showing a list of all your past scraping jobs.
    *   You can download the results from any past job by clicking its corresponding "Download" button.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

This extension was coded with the help of Cascade, a powerful agentic AI coding assistant from Windsurf, powered by Google's Gemini Pro models. ❤️
