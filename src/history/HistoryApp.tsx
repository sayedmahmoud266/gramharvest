import React, { useState, useEffect } from 'react';
import { HistoryItem, ChromeMessage, ScrapingSettings, ExportFormat } from '../types';

// Import version from package.json
const VERSION = '1.0.0-dev.1';

const HistoryApp: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ScrapingSettings>({ autoScroll: true });
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Load history and settings from storage
    chrome.storage.local.get(['scrapingHistory', 'scrapingSettings'], (data) => {
      const historyData = data.scrapingHistory || [];
      const settingsData = data.scrapingSettings || { autoScroll: true };
      setHistory(historyData);
      setSettings(settingsData);
      setLoading(false);

      // Check if we should auto-download the latest item
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('download_latest') === 'true' && historyData.length > 0) {
        handleDownload(historyData[0].id);
      }
    });

    // Listen for updates from the background script
    const messageListener = (message: ChromeMessage) => {
      if (message.command === 'history-update' && message.history) {
        setHistory(message.history);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleDownload = (historyId: number) => {
    chrome.runtime.sendMessage({ command: 'download-history', historyId });
  };

  const handleExport = (item: HistoryItem, format: ExportFormat) => {
    setSelectedItem(item);
    chrome.runtime.sendMessage({ 
      command: 'export-data', 
      historyId: item.id, 
      format: format.type,
      filename: format.filename 
    });
    setShowExportModal(false);
  };

  const handlePreview = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowPreview(true);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      chrome.runtime.sendMessage({ command: 'clear-history' });
      setHistory([]);
    }
  };

  const handleAutoScrollToggle = (enabled: boolean) => {
    const newSettings = { ...settings, autoScroll: enabled };
    setSettings(newSettings);
    chrome.storage.local.set({ scrapingSettings: newSettings });
    chrome.runtime.sendMessage({ command: 'update-settings', settings: newSettings });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-instagram-primary via-instagram-secondary to-instagram-accent flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto"></div>
          <p className="text-white text-center mt-4">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-instagram-primary via-instagram-secondary to-instagram-accent">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
          <div className="bg-white/20 px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                  </svg>
                  GramHarvest History
                </h1>
                <p className="text-white/80 mt-1">View and download your Instagram scraping results</p>
                <p className="text-xs text-white/60 mt-1">v{VERSION}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-white/80 text-sm">Auto-scroll:</label>
                  <input
                    type="checkbox"
                    checked={settings.autoScroll}
                    onChange={(e) => handleAutoScrollToggle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleClearHistory}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-white/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
                <p className="text-white/70">Start scraping Instagram profiles to see your history here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200 border border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-instagram-accent to-instagram-primary rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">@{item.username}</h3>
                            <div className="flex items-center gap-4 text-sm text-white/70">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {item.count} posts
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDate(item.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowExportModal(true);
                          }}
                          className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg flex items-center gap-2 hover:shadow-xl"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Export Data for @{selectedItem.username}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport(selectedItem, { type: 'json', filename: `${selectedItem.username}_data.json` })}
                  className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport(selectedItem, { type: 'csv', filename: `${selectedItem.username}_data.csv` })}
                  className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport(selectedItem, { type: 'excel', filename: `${selectedItem.username}_data.xlsx` })}
                  className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Export as Excel
                </button>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-4 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto text-gray-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview: @{selectedItem.username}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedItem.posts && selectedItem.posts.length > 0 ? (
                  selectedItem.posts.map((post, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3 text-sm bg-gray-50">
                      <div className="font-medium text-gray-900">{post.author}</div>
                      <div className="text-gray-600 text-xs">{post.type} • {post.createdAt}</div>
                      <div className="mt-1 text-gray-800">{post.caption}</div>
                      {post.thumbnailUrl && (
                        <div className="mt-2">
                          <img src={post.thumbnailUrl} alt="Post thumbnail" className="w-20 h-20 object-cover rounded" />
                        </div>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                        {post.views && <span>👁️ {post.views}</span>}
                      </div>
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs underline">
                        View Post
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No detailed post data available. Only links were collected.
                    <div className="mt-4 space-y-1">
                      {selectedItem.links.map((link, index) => (
                        <div key={index}>
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm underline">
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryApp;
