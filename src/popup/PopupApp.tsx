import React, { useState, useEffect } from 'react';
import { ScrapingState, ChromeMessage } from '../types';

const PopupApp: React.FC = () => {
  const [state, setState] = useState<ScrapingState>({
    isScraping: false,
    message: 'Ready',
    count: 0,
    currentTabId: null,
    currentUsername: null,
    stopScraping: false,
  });

  useEffect(() => {
    // Get initial state when popup opens
    chrome.runtime.sendMessage({ command: 'get-status' }, (response: ScrapingState) => {
      if (!chrome.runtime.lastError && response) {
        setState(response);
      }
    });

    // Listen for updates from the background script
    const messageListener = (message: ChromeMessage) => {
      if (message.command === 'status-update' && message.state) {
        setState(message.state);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleStartScraping = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('instagram.com/')) {
      chrome.runtime.sendMessage({ command: 'start-scraping', tabId: tab.id });
    } else {
      setState(prev => ({ ...prev, message: 'Not an Instagram profile page.' }));
    }
  };

  const handleStopScraping = () => {
    chrome.runtime.sendMessage({ command: 'stop-scraping' });
  };

  const handleViewHistory = () => {
    chrome.tabs.create({ url: 'history.html' });
  };

  const handleDownloadPartial = () => {
    chrome.runtime.sendMessage({ command: 'download-partial' });
  };

  const showDownloadButton = 
    !state.isScraping && 
    state.count > 0 && 
    (state.message === 'Scraping stopped by user.' || state.message === 'Scraping finished.');

  return (
    <div className="w-80 p-6 bg-gradient-to-br from-instagram-primary via-instagram-secondary to-instagram-accent text-white">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Instagram Scraper
        </h1>

        <div className="space-y-4">
          {state.isScraping ? (
            <>
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Scraping... Found {state.count} posts.</p>
              </div>
              <button
                onClick={handleStopScraping}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
              >
                Stop Scraping
              </button>
            </>
          ) : (
            <>
              <p className="text-center text-sm mb-4 bg-white/20 rounded-lg p-3">
                {state.message || 'Ready. Navigate to a profile and click scrape.'}
              </p>
              <button
                onClick={handleStartScraping}
                className="w-full bg-white text-instagram-primary font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Scrape Current Profile
              </button>
              {showDownloadButton && (
                <button
                  onClick={handleDownloadPartial}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Download Results
                </button>
              )}
            </>
          )}

          <hr className="border-white/30" />
          
          <button
            onClick={handleViewHistory}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg backdrop-blur-sm"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupApp;
