import { ScrapingState, HistoryItem, PostData, ScrapeResult, ChromeMessage } from '../types';
import * as XLSX from 'xlsx';

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
  
  // Helper function to extract numeric value from text
  const extractNumber = (text: string | null | undefined): number => {
    if (!text) return 0;
    const cleanText = text.replace(/[^\d.KMB]/gi, '');
    const num = parseFloat(cleanText);
    if (isNaN(num)) return 0;
    
    if (text.includes('K')) return Math.floor(num * 1000);
    if (text.includes('M')) return Math.floor(num * 1000000);
    if (text.includes('B')) return Math.floor(num * 1000000000);
    return Math.floor(num);
  };

  // Helper function to get author from profile page
  const getAuthorFromPage = (): string => {
    // Try to get username from URL
    const urlMatch = window.location.pathname.match(/\/([^\/]+)\/?/);
    if (urlMatch && urlMatch[1] && urlMatch[1] !== 'p' && urlMatch[1] !== 'reel') {
      return urlMatch[1];
    }
    
    // Try to get from page title or meta tags
    const titleMatch = document.title.match(/\(@([^)]+)\)/);
    if (titleMatch) return titleMatch[1];
    
    return 'Unknown';
  };

  // Helper function to detect page type
  const getPageType = (): 'main_profile' | 'reels_tab' | 'other' => {
    const url = window.location.href;
    if (url.includes('/reels/') || url.includes('/reels')) {
      return 'reels_tab';
    } else if (url.match(/\/[^\/]+\/?$/)) {
      return 'main_profile';
    }
    return 'other';
  };

  const currentAuthor = getAuthorFromPage();
  const pageType = getPageType();

  // Look for post containers based on page type
  let postContainers: Element[] = [];
  
  if (pageType === 'main_profile') {
    // Main profile tab - posts have image thumbnails with captions in alt attributes
    postContainers = [
      ...document.querySelectorAll('a[href*="/p/"]'),
      ...document.querySelectorAll('a[href*="/reel/"]')
    ];
  } else {
    // Reels tab or other views
    postContainers = [
      ...document.querySelectorAll('article'),
      ...document.querySelectorAll('div[role="button"] a[href*="/p/"], div[role="button"] a[href*="/reel/"]'),
      ...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')
    ];
  }

  // Process each container
  postContainers.forEach(container => {
    try {
      let linkElement: HTMLAnchorElement | null = null;
      let postContainer: Element = container;

      // Handle different container types
      if (container.tagName === 'A') {
        linkElement = container as HTMLAnchorElement;
        postContainer = container.closest('div') || container;
      } else {
        linkElement = container.querySelector('a[href*="/p/"], a[href*="/reel/"]') as HTMLAnchorElement;
      }

      if (!linkElement || !linkElement.href) return;
      
      const url = linkElement.href;
      if (links.has(url)) return; // Skip duplicates
      
      links.add(url);
      
      // Determine post type
      let postType: 'post' | 'reel' | 'story' = 'post';
      if (url.includes('/reel/')) postType = 'reel';
      if (url.includes('/stories/')) postType = 'story';

      let caption = '';
      let thumbnailUrl = '';
      let likes = 0;
      let comments = 0;
      let views = 0;
      let createdAt = new Date().toISOString();

      if (pageType === 'main_profile') {
        // Main profile tab - extract from image alt and src
        const imageElement = linkElement.querySelector('img');
        if (imageElement) {
          caption = imageElement.getAttribute('alt') || '';
          thumbnailUrl = imageElement.getAttribute('src') || '';
          
          // Convert relative URLs to absolute URLs
          if (thumbnailUrl && thumbnailUrl.startsWith('./')) {
            thumbnailUrl = new URL(thumbnailUrl, window.location.href).href;
          }
        }
        
        // For main profile, engagement metrics are usually not visible in grid view
        // We'll set them to 0 and they can be updated if found
        
      } else {
        // Reels tab or other views - use the previous logic
        const containerParent = postContainer.closest('div') || postContainer;
        
        // Look for engagement metrics (likes, comments, views)
        const engagementElements = [
          ...containerParent.querySelectorAll('span'),
          ...postContainer.querySelectorAll('span')
        ];

        // Parse engagement metrics from spans
        engagementElements.forEach(span => {
          const text = span.textContent?.trim();
          if (!text) return;

          // Check if this span contains numeric data
          if (/^\d+[\d.,KMB]*$/.test(text.replace(/\s/g, ''))) {
            const numValue = extractNumber(text);
            
            // Determine what this number represents based on context
            const parentElement = span.closest('li, div, button');
            const siblings = parentElement ? Array.from(parentElement.parentElement?.children || []) : [];
            const siblingIndex = siblings.indexOf(parentElement as Element);
            
            // Instagram typically shows metrics in order: likes, comments, views (for reels)
            // Look for visual indicators or aria-labels
            const hasLikeIcon = parentElement?.querySelector('svg[aria-label*="like"], svg[aria-label*="Like"]');
            const hasCommentIcon = parentElement?.querySelector('svg[aria-label*="comment"], svg[aria-label*="Comment"]');
            const hasViewIcon = parentElement?.querySelector('svg[aria-label*="view"], svg[aria-label*="View"]');
            
            if (hasLikeIcon || (siblingIndex === 0 && numValue > 0)) {
              likes = Math.max(likes, numValue);
            } else if (hasCommentIcon || (siblingIndex === 1 && numValue > 0)) {
              comments = Math.max(comments, numValue);
            } else if (hasViewIcon || (postType === 'reel' && numValue > 1000)) {
              views = Math.max(views, numValue);
            }
          }
        });

        // Try to extract caption from text content (for reels tab, captions are usually not available)
        const textElements = [
          ...containerParent.querySelectorAll('span'),
          ...postContainer.querySelectorAll('span')
        ];
        
        textElements.forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > caption.length && text.length > 10 && 
              !text.match(/^\d+[\d.,KMB]*$/) && // Not just numbers
              !text.includes('ago') && // Not time stamps
              !text.includes('•')) { // Not metadata
            caption = text;
          }
        });

        // Try to get creation date from time elements or data attributes
        const timeElement = containerParent.querySelector('time');
        if (timeElement) {
          createdAt = timeElement.getAttribute('datetime') || 
                     timeElement.getAttribute('title') || 
                     timeElement.textContent || 
                     createdAt;
        }
      }

      const postData = {
        url: url,
        author: currentAuthor,
        caption: caption,
        thumbnailUrl: thumbnailUrl || undefined,
        likes: likes,
        comments: comments,
        createdAt: createdAt,
        views: postType === 'reel' && views > 0 ? views : undefined,
        type: postType,
        pageType: pageType
      };
      
      posts.push(postData);
      
    } catch (error) {
      console.log('Error extracting post data:', error);
      
      // Fallback: just add the URL
      if (container.tagName === 'A') {
        const url = (container as HTMLAnchorElement).href;
        if (url && !links.has(url)) {
          links.add(url);
          posts.push({
            url: url,
            author: currentAuthor,
            caption: '',
            thumbnailUrl: undefined,
            likes: 0,
            comments: 0,
            createdAt: new Date().toISOString(),
            views: undefined,
            type: url.includes('/reel/') ? 'reel' : 'post',
            pageType: pageType
          });
        }
      }
    }
  });
  
  // Additional fallback: collect any missed links
  document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(anchor => {
    const href = (anchor as HTMLAnchorElement).href;
    if (href && !links.has(href)) {
      links.add(href);
      
      // Add basic post data for missed links
      if (!posts.find(p => p.url === href)) {
        posts.push({
          url: href,
          author: currentAuthor,
          caption: '',
          thumbnailUrl: undefined,
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          views: undefined,
          type: href.includes('/reel/') ? 'reel' : 'post',
          pageType: pageType
        });
      }
    }
  });

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
        const headers = 'URL,Author,Caption,Thumbnail URL,Likes,Comments,Created At,Views,Type,Page Type\n';
        const rows = historyItem.posts.map((post: PostData) => 
          `"${post.url}","${post.author || ''}","${(post.caption || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}","${post.thumbnailUrl || ''}",${post.likes || 0},${post.comments || 0},"${post.createdAt || ''}",${post.views || ''},"${post.type || 'post'}","${post.pageType || ''}"`
        ).join('\n');
        content = headers + rows;
      } else {
        content = 'URL\n' + historyItem.links.join('\n');
      }
      mimeType = 'text/csv';
      break;
    case 'excel':
      // Create proper XLSX file using xlsx library
      if (historyItem.posts && historyItem.posts.length > 0) {
        const worksheetData = [
          ['URL', 'Author', 'Caption', 'Thumbnail URL', 'Likes', 'Comments', 'Created At', 'Views', 'Type', 'Page Type'],
          ...historyItem.posts.map((post: PostData) => [
            post.url,
            post.author || '',
            (post.caption || '').replace(/[\r\n]+/g, ' '),
            post.thumbnailUrl || '',
            post.likes || 0,
            post.comments || 0,
            post.createdAt || '',
            post.views || '',
            post.type || 'post',
            post.pageType || ''
          ])
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Instagram Posts');
        
        // Generate XLSX file as base64
        const xlsxBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
        content = xlsxBuffer;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        // Fallback for links-only data
        const worksheetData = [
          ['URL'],
          ...historyItem.links.map((link: string) => [link])
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Instagram Links');
        
        const xlsxBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
        content = xlsxBuffer;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      break;
  }

  // Create data URL instead of blob URL for service worker compatibility
  let dataUrl: string;
  if (format === 'excel') {
    // For XLSX files, content is already base64 encoded
    dataUrl = `data:${mimeType};base64,${content}`;
  } else {
    // For JSON and CSV, encode as UTF-8
    dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
  }
  
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
