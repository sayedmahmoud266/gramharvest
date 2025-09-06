document.addEventListener('DOMContentLoaded', () => {
    const scrapeButton = document.getElementById('scrape-button');
    const stopButton = document.getElementById('stop-button');
    const historyButton = document.getElementById('history-button');
    const downloadPartialButton = document.getElementById('download-partial-button');
    const statusEl = document.getElementById('status');

    // Update UI based on current state from background
    const updateUI = (state) => {
        downloadPartialButton.classList.add('hidden'); // Hide by default

        if (state.isScraping) {
            statusEl.textContent = `Scraping... Found ${state.count} posts.`;
            scrapeButton.classList.add('hidden');
            stopButton.classList.remove('hidden');
        } else {
            statusEl.textContent = state.message || 'Ready. Navigate to a profile and click scrape.';
            scrapeButton.classList.remove('hidden');
            stopButton.classList.add('hidden');

            // Show partial download button if the last action was a user-initiated stop
            if (state.message === 'Scraping stopped by user.' && state.count > 0) {
                downloadPartialButton.classList.remove('hidden');
            } else if (state.message === 'Scraping finished.' && state.count > 0) {
                downloadPartialButton.classList.remove('hidden');
            }
        }
    };

    // Get initial state when popup opens
    chrome.runtime.sendMessage({ command: 'get-status' }, (response) => {
        if (!chrome.runtime.lastError) updateUI(response);
    });

    // Button listeners
    scrapeButton.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes('instagram.com/')) {
            chrome.runtime.sendMessage({ command: 'start-scraping', tabId: tab.id });
        } else {
            statusEl.textContent = 'Not an Instagram profile page.';
        }
    });

    stopButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ command: 'stop-scraping' });
    });

    historyButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'history.html' });
    });

    downloadPartialButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ command: 'download-partial' });
    });

    // Listen for updates from the background script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.command === 'status-update') updateUI(message.state);
    });
});
