document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('history-list');

    const renderHistory = (history) => {
        historyList.innerHTML = '';
        if (!history || history.length === 0) {
            historyList.innerHTML = '<li>No history yet.</li>';
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            const itemDate = new Date(item.date).toLocaleString();
            li.innerHTML = `
                <span>
                    <strong>${item.username}</strong> (${item.count} posts)<br>
                    <small>${itemDate}</small>
                </span>
                <button data-id="${item.id}">Download</button>
            `;
            historyList.appendChild(li);
        });
    };

    const triggerDownloadForLatest = (history) => {
        if (history && history.length > 0) {
            const latestItemId = history[0].id;
            chrome.runtime.sendMessage({ command: 'download-history', historyId: latestItemId });
        }
    };

    historyList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
            chrome.runtime.sendMessage({ command: 'download-history', historyId: e.target.dataset.id });
        }
    });

    chrome.storage.local.get('scrapingHistory', (data) => {
        const history = data.scrapingHistory || [];
        renderHistory(history);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('download_latest') === 'true') {
            triggerDownloadForLatest(history);
        }
    });

    // Listen for updates from the background script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.command === 'history-update') {
            renderHistory(message.history);
        }
    });
});
