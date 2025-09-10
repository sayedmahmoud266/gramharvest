export interface ScrapingState {
  isScraping: boolean;
  message: string;
  count: number;
  currentTabId: number | null;
  currentUsername: string | null;
  stopScraping: boolean;
}

export interface HistoryItem {
  id: number;
  date: string;
  username: string;
  count: number;
  links: string[];
}

export interface ScrapeResult {
  links: string[];
  endOfPage: boolean;
}

export interface ChromeMessage {
  command: string;
  tabId?: number;
  historyId?: number;
  state?: ScrapingState;
  history?: HistoryItem[];
}
