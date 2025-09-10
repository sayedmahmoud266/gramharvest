# Data Collection System

## Overview

GramHarvest implements a sophisticated data collection system that extracts comprehensive metadata from Instagram posts and reels.

## Data Structure

### PostData Interface
```typescript
interface PostData {
  url: string;           // Direct link to post/reel
  author: string;        // Username of post creator
  caption: string;       // Full post caption text
  likes: number;         // Number of likes
  comments: number;      // Number of comments
  createdAt: string;     // Post creation timestamp
  views?: number;        // View count (videos/reels only)
  type: 'post' | 'reel' | 'story';  // Content type
}
```

### Legacy Support
- Maintains backward compatibility with `links` array
- Both `links` and `posts` arrays are populated
- Export functions handle both data formats

## Scraping Process

### DOM Element Detection
The scraper identifies Instagram posts using multiple selectors:

```typescript
// Primary post containers
document.querySelectorAll('article')

// Post links
article.querySelector('a[href*="/p/"], a[href*="/reel/"]')

// Metadata selectors
const authorElement = article.querySelector('a[role="link"] span, header a span');
const captionElement = article.querySelector('[data-testid="post-caption"] span, article div[role="button"] span');
const likesElement = article.querySelector('[data-testid="like-count"], a[href*="/liked_by/"]');
const commentsElement = article.querySelector('[data-testid="comments-count"], a[href*="/comments/"]');
const timeElement = article.querySelector('time');
const viewsElement = article.querySelector('[data-testid="video-view-count"]');
```

### Data Extraction Logic

#### URL Extraction
- Identifies post and reel URLs using href patterns
- Filters for `/p/` (posts) and `/reel/` (reels) paths
- Deduplicates URLs using Set data structure

#### Metadata Parsing
- **Author**: Extracts from profile link elements
- **Caption**: Retrieves full text content, handles line breaks
- **Engagement**: Parses numeric values from like/comment elements
- **Timestamps**: Uses `datetime` attribute or fallback to text content
- **Views**: Specific to video content, optional field

#### Type Classification
```typescript
let postType: 'post' | 'reel' | 'story' = 'post';
if (url.includes('/reel/')) postType = 'reel';
// Story detection logic can be added here
```

## Auto-Scroll Mechanism

### Scroll Control
```typescript
function scrapeAndScroll(autoScroll: boolean = true): ScrapeResult {
  const scrollHeightBefore = document.body.scrollHeight;
  
  if (autoScroll) {
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  // ... data collection logic
  
  const scrollHeightAfter = document.body.scrollHeight;
  const endOfPage = scrollHeightBefore === scrollHeightAfter;
  
  return { links, posts, endOfPage };
}
```

### End Detection
- Compares scroll height before and after scroll operation
- Marks `endOfPage: true` when no new content loads
- Prevents infinite loops on pages with finite content

## Error Handling

### Graceful Degradation
```typescript
document.querySelectorAll('article').forEach(article => {
  try {
    // Data extraction logic
  } catch (error) {
    console.log('Error extracting post data:', error);
    // Continue with next article
  }
});
```

### Fallback Mechanisms
- Falls back to basic link collection if article parsing fails
- Provides default values for missing metadata
- Handles Instagram UI changes gracefully

## Performance Considerations

### Throttling
- 1-second delay between scroll operations
- Prevents rate limiting by Instagram
- Reduces browser resource consumption

### Memory Efficiency
- Uses Set for deduplication to prevent memory bloat
- Clears temporary variables after each iteration
- Efficient DOM querying patterns

### Batch Processing
- Processes all visible articles in single pass
- Minimizes DOM queries through efficient selectors
- Batches results for transmission to background script

## Instagram Compatibility

### Selector Resilience
- Multiple fallback selectors for each data type
- Handles both old and new Instagram UI patterns
- Adapts to `data-testid` changes

### Content Type Support
- Posts (single images/carousels)
- Reels (short videos)
- Stories (future enhancement)
- IGTV content (embedded in posts)

## Data Quality

### Validation
- URL format validation
- Numeric parsing with fallbacks
- Text sanitization for special characters
- Timestamp format standardization

### Completeness
- Tracks which fields were successfully extracted
- Provides fallback values for missing data
- Logs extraction errors for debugging

## Future Enhancements

### Planned Features
- Story content extraction
- Carousel post indexing
- Hashtag and mention extraction
- Location data collection
- Enhanced video metadata

### Scalability
- Pagination support for large profiles
- Incremental updates for previously scraped profiles
- Background sync for real-time updates
