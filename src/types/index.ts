export interface ScrapingState {
  isScraping: boolean;
  message: string;
  count: number;
  currentTabId: number | null;
  currentUsername: string | null;
  stopScraping: boolean;
}

export interface PostData {
  url: string;
  author: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
  views?: number;
  type: 'post' | 'reel' | 'story';
}

export interface HistoryItem {
  id: number;
  date: string;
  username: string;
  count: number;
  posts: PostData[];
  // Keep links for backward compatibility
  links: string[];
}

export interface ScrapeResult {
  posts: PostData[];
  links: string[]; // Keep for backward compatibility
  endOfPage: boolean;
}

export interface ScrapingSettings {
  autoScroll: boolean;
}

export interface ExportFormat {
  type: 'json' | 'csv' | 'excel';
  filename: string;
}

export interface ChromeMessage {
  command: string;
  tabId?: number;
  historyId?: number;
  state?: ScrapingState;
  history?: HistoryItem[];
}
