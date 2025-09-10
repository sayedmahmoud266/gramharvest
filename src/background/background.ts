import { ScrapingState, HistoryItem, ScrapeResult, ChromeMessage, PostData } from '../types';

// State management
let state: ScrapingState = {
  isScraping: false,
  message: 'Ready',
  count: 0,
  currentTabId: null,
  currentUsername: null,
  stopScraping: false,
};

let currentLinks = new Set<string>();
let currentPosts: any[] = [];
let lastStoppedJob: { username: string; links: string[]; posts: any[] } | null = null;
let suggestedFileName: string | null = null;

// Listen for commands from the popup
chrome.runtime.onMessage.addListener((message: ChromeMessage, _sender, sendResponse) => {
  if (message.command === 'start-scraping' && message.tabId) {
    startScraping(message.tabId);
  } else if (message.command === 'stop-scraping') {
    stopScraping();
  } else if (message.command === 'get-status') {
    sendResponse(state);
  } else if (message.command === 'download-history' && message.historyId) {
    downloadHistoryItem(message.historyId);
  } else if (message.command === 'download-partial') {
    handlePartialDownloadRequest();
  } else if (message.command === 'export-data') {
    handleExportData(message);
  } else if (message.command === 'clear-history') {
    handleClearHistory();
  } else if (message.command === 'update-settings') {
    handleUpdateSettings(message);
  }
});

chrome.downloads.onDeterminingFilename.addListener((_downloadItem, suggest) => {
  if (suggest && suggestedFileName) {
    suggest({ filename: suggestedFileName });
  }
});

async function startScraping(tabId: number): Promise<void> {
  if (state.isScraping) return;

  // Reset state for a new job
  lastStoppedJob = null;
  state.isScraping = true;
  state.stopScraping = false;
  state.currentTabId = tabId;
  state.count = 0;
  currentLinks.clear();
  currentPosts.length = 0;

  const tab = await chrome.tabs.get(tabId);
  const username = tab.url?.split('instagram.com/')[1]?.split('/')[0] || 'unknown';
  state.currentUsername = username;

  sendStatusUpdate();

  // Get auto-scroll setting
  const { scrapingSettings = { autoScroll: true } } = await chrome.storage.local.get('scrapingSettings');

  // Main scraping loop
  while (!state.stopScraping) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: state.currentTabId },
        func: scrapeAndScroll,
        args: [scrapingSettings.autoScroll]
      });

      const result = results[0]?.result;
      if (!result) continue;
      const { links, posts, endOfPage }: ScrapeResult = result;
      links.forEach(link => currentLinks.add(link));
      posts.forEach(post => currentPosts.push(post));
      state.count = currentLinks.size;
      sendStatusUpdate();

      if (endOfPage || state.stopScraping) {
        break;
      }

      // Wait a bit before the next scroll to avoid being rate-limited
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Scraping error:', error);
      break;
    }
  }

  // If the scrape was stopped manually, store the partial results temporarily
  if (state.stopScraping && currentLinks.size > 0) {
    lastStoppedJob = { username, links: Array.from(currentLinks), posts: [...currentPosts] };
  }
  // If the scrape finished normally, save the full results to history
  else if (!state.stopScraping && currentLinks.size > 0) {
    await saveHistory(username, Array.from(currentLinks), currentPosts);
    lastStoppedJob = { username, links: Array.from(currentLinks), posts: [...currentPosts] };
  }

  const finalMessage = state.stopScraping ? 'Scraping stopped by user.' : 'Scraping finished.';
  state.isScraping = false;
  state.message = finalMessage;
  sendStatusUpdate();
}

function stopScraping(): void {
  if (state.isScraping) {
    state.stopScraping = true;
  }
}

async function saveHistory(username: string, links: string[], posts: any[] = []): Promise<void> {
  const { scrapingHistory = [] } = await chrome.storage.local.get('scrapingHistory');
  const newHistoryItem: HistoryItem = {
    id: Date.now(),
    date: new Date().toISOString(),
    username,
    count: links.length,
    links,
    posts: posts || [], // Add posts array, fallback to empty array for backward compatibility
  };
  const updatedHistory = [newHistoryItem, ...scrapingHistory];
  await chrome.storage.local.set({ scrapingHistory: updatedHistory });
  sendHistoryUpdate(updatedHistory);
}

async function handlePartialDownloadRequest(): Promise<void> {
  if (!lastStoppedJob) return;

  // Save the partial job to history, making it the latest item
  await saveHistory(lastStoppedJob.username, lastStoppedJob.links, lastStoppedJob.posts);

  // Open the history page with a flag to trigger the download
  chrome.tabs.create({ url: 'history.html?download_latest=true' });

  // Clear the temporary job data
  lastStoppedJob = null;
}

async function downloadHistoryItem(historyId: number): Promise<void> {
  const { scrapingHistory = [] } = await chrome.storage.local.get('scrapingHistory');
  const item = scrapingHistory.find((h: HistoryItem) => h.id === historyId);

  if (item) {
    const jsonContent = JSON.stringify(item.links, null, 2);
    const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent);
    const fileName = `ig_scrapped_posts/${item.username}_ig_posts_${item.id}.json`;
    suggestedFileName = fileName;

    chrome.downloads.download({
      url: url,
      filename: fileName,
    });
  }
}

// Functions to communicate with the popup
function sendStatusUpdate(): void {
  chrome.runtime.sendMessage({ command: 'status-update', state }).catch(() => {});
}

function sendHistoryUpdate(history: HistoryItem[]): void {
  chrome.runtime.sendMessage({ command: 'history-update', history }).catch(() => {});
}

// This function is injected into the page to perform the scraping
async function scrapeAndScroll(autoScroll: boolean = true): Promise<ScrapeResult> {
  const scrollHeightBefore = document.body.scrollHeight;
  
  // Only scroll if auto-scroll is enabled
  if (autoScroll) {
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  // Collect links and enhanced post data
  const links = new Set<string>();
  const posts: any[] = [];
  
  // Find all post articles
  document.querySelectorAll('article').forEach(article => {
    try {
      // Get post link
      const linkElement = article.querySelector('a[href*="/p/"], a[href*="/reel/"]');
      if (!linkElement) return;
      
      const url = (linkElement as HTMLAnchorElement).href;
      if (!url) return;
      
      links.add(url);
      
      // Try to extract enhanced data
      const authorElement = article.querySelector('a[role="link"] span, header a span');
      const captionElement = article.querySelector('[data-testid="post-caption"] span, article div[role="button"] span');
      const likesElement = article.querySelector('[data-testid="like-count"], a[href*="/liked_by/"]');
      const commentsElement = article.querySelector('[data-testid="comments-count"], a[href*="/comments/"]');
      const timeElement = article.querySelector('time');
      const viewsElement = article.querySelector('[data-testid="video-view-count"]');
      
      // Determine post type
      let postType: 'post' | 'reel' | 'story' = 'post';
      if (url.includes('/reel/')) postType = 'reel';
      
      const postData = {
        url: url,
        author: authorElement?.textContent?.trim() || 'Unknown',
        caption: captionElement?.textContent?.trim() || '',
        likes: parseInt(likesElement?.textContent?.replace(/[^\d]/g, '') || '0') || 0,
        comments: parseInt(commentsElement?.textContent?.replace(/[^\d]/g, '') || '0') || 0,
        createdAt: timeElement?.getAttribute('datetime') || timeElement?.textContent || new Date().toISOString(),
        views: viewsElement ? parseInt(viewsElement.textContent?.replace(/[^\d]/g, '') || '0') : undefined,
        type: postType
      };
      
      posts.push(postData);
    } catch (error) {
      console.log('Error extracting post data:', error);
    }
  });
  
  // Fallback: collect links from all anchors if no articles found
  if (links.size === 0) {
    document.querySelectorAll('a').forEach(anchor => {
      const href = anchor.href;
      if (href && (href.includes('/p/') || href.includes('/reel/'))) {
        links.add(href);
      }
    });
  }

  const scrollHeightAfter = document.body.scrollHeight;
  const endOfPage = scrollHeightBefore === scrollHeightAfter;

  return { links: Array.from(links), posts, endOfPage };
}

// Handler for exporting data in different formats
async function handleExportData(message: any): Promise<void> {
  const { historyId, format, filename } = message;
  const { scrapingHistory = [] } = await chrome.storage.local.get('scrapingHistory');
  const historyItem = scrapingHistory.find((item: HistoryItem) => item.id === historyId);
  
  if (!historyItem) return;

  let content = '';
  let mimeType = '';

  switch (format) {
    case 'json':
      content = JSON.stringify(historyItem, null, 2);
      mimeType = 'application/json';
      break;
    case 'csv':
      if (historyItem.posts && historyItem.posts.length > 0) {
        const headers = 'URL,Author,Caption,Likes,Comments,Created At,Views,Type\n';
        const rows = historyItem.posts.map((post: PostData) => 
          `"${post.url}","${post.author}","${post.caption.replace(/"/g, '""')}",${post.likes},${post.comments},"${post.createdAt}",${post.views || 0},"${post.type}"`
        ).join('\n');
        content = headers + rows;
      } else {
        content = 'URL\n' + historyItem.links.join('\n');
      }
      mimeType = 'text/csv';
      break;
    case 'excel':
      // For Excel, we'll use CSV format with .xlsx extension
      if (historyItem.posts && historyItem.posts.length > 0) {
        const headers = 'URL\tAuthor\tCaption\tLikes\tComments\tCreated At\tViews\tType\n';
        const rows = historyItem.posts.map((post: PostData) => 
          `${post.url}\t${post.author}\t${post.caption}\t${post.likes}\t${post.comments}\t${post.createdAt}\t${post.views || 0}\t${post.type}`
        ).join('\n');
        content = headers + rows;
      } else {
        content = 'URL\n' + historyItem.links.join('\n');
      }
      mimeType = 'application/vnd.ms-excel';
      break;
  }

  // Create data URL instead of blob URL for service worker compatibility
  const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
  
  suggestedFileName = filename;
  chrome.downloads.download({
    url: dataUrl,
    filename: filename,
    saveAs: true
  });
}

// Handler for clearing history
async function handleClearHistory(): Promise<void> {
  await chrome.storage.local.set({ scrapingHistory: [] });
  sendHistoryUpdate([]);
}

// Handler for updating settings
async function handleUpdateSettings(message: any): Promise<void> {
  const { settings } = message;
  await chrome.storage.local.set({ scrapingSettings: settings });
}
