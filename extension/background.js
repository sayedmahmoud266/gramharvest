// State management
let state = {
    isScraping: false,
    message: 'Ready',
    count: 0,
    currentTabId: null,
    currentUsername: null,
    stopScraping: false,
};

let currentLinks = new Set();
let lastStoppedJob = null;
let suggestedFileName = null;

// Listen for commands from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'start-scraping') {
        startScraping(message.tabId);
    } else if (message.command === 'stop-scraping') {
        stopScraping();
    } else if (message.command === 'get-status') {
        sendResponse(state);
    } else if (message.command === 'download-history') {
        downloadHistoryItem(message.historyId);
    } else if (message.command === 'download-partial') {
        handlePartialDownloadRequest();
    }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    if (suggest && suggestedFileName){
        suggest({filename: suggestedFileName});
    }
});

async function startScraping(tabId) {
    if (state.isScraping) return;

    // Reset state for a new job
    lastStoppedJob = null; // Clear any previous partial download
    state.isScraping = true;
    state.stopScraping = false;
    state.currentTabId = tabId;
    state.count = 0;
    currentLinks.clear();

    const tab = await chrome.tabs.get(tabId);
    const username = tab.url.split('instagram.com/')[1].split('/')[0];
    state.currentUsername = username;

    sendStatusUpdate();

    // Main scraping loop
    while (!state.stopScraping) {
        const results = await chrome.scripting.executeScript({
            target: { tabId: state.currentTabId },
            func: scrapeAndScroll,
        });

        const { links, endOfPage } = results[0].result;
        links.forEach(link => currentLinks.add(link));
        state.count = currentLinks.size;
        sendStatusUpdate();

        if (endOfPage || state.stopScraping) {
            break;
        }

        // Wait a bit before the next scroll to avoid being rate-limited
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

    // If the scrape was stopped manually, store the partial results temporarily
    if (state.stopScraping && currentLinks.size > 0) {
        lastStoppedJob = { username, links: Array.from(currentLinks) };
    } 
    // If the scrape finished normally, save the full results to history
    else if (!state.stopScraping && currentLinks.size > 0) {
        await saveHistory(username, Array.from(currentLinks));
        lastStoppedJob = { username, links: Array.from(currentLinks) };
    }

    const finalMessage = state.stopScraping ? 'Scraping stopped by user.' : 'Scraping finished.';
    finishScraping(finalMessage);
}

function stopScraping() {
    if (state.isScraping) {
        state.stopScraping = true;
        // The main loop in startScraping will see this flag and handle the rest.
    }
}

function finishScraping(message) {
    state.isScraping = false;
    state.stopScraping = false;
    state.message = message;
    sendStatusUpdate();
}

async function saveHistory(username, links) {
    const { scrapingHistory = [] } = await chrome.storage.local.get('scrapingHistory');
    const newHistoryItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        username,
        count: links.length,
        links,
    };
    const updatedHistory = [newHistoryItem, ...scrapingHistory];
    await chrome.storage.local.set({ scrapingHistory: updatedHistory });
    sendHistoryUpdate(updatedHistory);
}

async function handlePartialDownloadRequest() {
    if (!lastStoppedJob) return;

    // Save the partial job to history, making it the latest item
    await saveHistory(lastStoppedJob.username, lastStoppedJob.links);

    // Open the history page with a flag to trigger the download
    chrome.tabs.create({ url: 'history.html?download_latest=true' });

    // Clear the temporary job data
    lastStoppedJob = null;
}

async function downloadHistoryItem(historyId) {
    const { scrapingHistory = [] } = await chrome.storage.local.get('scrapingHistory');
    const item = scrapingHistory.find(h => h.id == historyId);

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
function sendStatusUpdate() {
    chrome.runtime.sendMessage({ command: 'status-update', state }).catch(() => {});
}

function sendHistoryUpdate(history) {
    chrome.runtime.sendMessage({ command: 'history-update', history }).catch(() => {});
}

// This function is injected into the page to perform the scraping
async function scrapeAndScroll() {
    const scrollHeightBefore = document.body.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
    
    // Wait for new content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    const links = new Set();
    document.querySelectorAll('a').forEach(anchor => {
        const href = anchor.href;
        if (href && (href.includes('/p/') || href.includes('/reel/'))) {
            links.add(href);
        }
    });

    const scrollHeightAfter = document.body.scrollHeight;
    const endOfPage = scrollHeightBefore === scrollHeightAfter;

    return { links: Array.from(links), endOfPage };
}
