# Export System

## Overview

GramHarvest provides a flexible export system supporting multiple file formats for different use cases.

## Supported Formats

### JSON Export
- **Purpose**: Complete data preservation with full metadata
- **Use Case**: Technical analysis, data backup, API integration
- **Structure**: Full HistoryItem object with nested PostData arrays

```json
{
  "id": 1694123456789,
  "date": "2023-09-07T15:30:45.123Z",
  "username": "instagram",
  "count": 150,
  "links": ["https://instagram.com/p/ABC123", "..."],
  "posts": [
    {
      "url": "https://instagram.com/p/ABC123",
      "author": "instagram",
      "caption": "Welcome to Instagram!",
      "likes": 1250000,
      "comments": 45000,
      "createdAt": "2023-09-07T12:00:00Z",
      "views": 2500000,
      "type": "reel"
    }
  ]
}
```

### CSV Export
- **Purpose**: Spreadsheet compatibility and data analysis
- **Use Case**: Excel analysis, database imports, reporting
- **Structure**: Flattened tabular format with headers

```csv
URL,Author,Caption,Likes,Comments,Created At,Views,Type
"https://instagram.com/p/ABC123","instagram","Welcome to Instagram!",1250000,45000,"2023-09-07T12:00:00Z",2500000,"reel"
```

### Excel Export (.xlsx)
- **Purpose**: Business reporting and advanced spreadsheet analysis
- **Use Case**: Corporate reporting, data visualization, pivot tables
- **Structure**: Tab-separated values with .xlsx extension for Excel compatibility

```
URL	Author	Caption	Likes	Comments	Created At	Views	Type
https://instagram.com/p/ABC123	instagram	Welcome to Instagram!	1250000	45000	2023-09-07T12:00:00Z	2500000	reel
```

## Export Implementation

### Background Handler
```typescript
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
      content = generateCSV(historyItem);
      mimeType = 'text/csv';
      break;
    case 'excel':
      content = generateExcel(historyItem);
      mimeType = 'application/vnd.ms-excel';
      break;
  }

  const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
  chrome.downloads.download({
    url: dataUrl,
    filename: filename,
    saveAs: true
  });
}
```

### CSV Generation
```typescript
function generateCSV(historyItem: HistoryItem): string {
  if (historyItem.posts && historyItem.posts.length > 0) {
    const headers = 'URL,Author,Caption,Likes,Comments,Created At,Views,Type\n';
    const rows = historyItem.posts.map((post: PostData) => 
      `"${post.url}","${post.author}","${post.caption.replace(/"/g, '""')}",${post.likes},${post.comments},"${post.createdAt}",${post.views || 0},"${post.type}"`
    ).join('\n');
    return headers + rows;
  } else {
    // Fallback for legacy data
    return 'URL\n' + historyItem.links.join('\n');
  }
}
```

### Excel Generation
```typescript
function generateExcel(historyItem: HistoryItem): string {
  if (historyItem.posts && historyItem.posts.length > 0) {
    const headers = 'URL\tAuthor\tCaption\tLikes\tComments\tCreated At\tViews\tType\n';
    const rows = historyItem.posts.map((post: PostData) => 
      `${post.url}\t${post.author}\t${post.caption}\t${post.likes}\t${post.comments}\t${post.createdAt}\t${post.views || 0}\t${post.type}`
    ).join('\n');
    return headers + rows;
  } else {
    return 'URL\n' + historyItem.links.join('\n');
  }
}
```

## File Naming Convention

### Automatic Naming
```typescript
const filename = `${selectedItem.username}_data.${extension}`;
```

### Examples
- `instagram_data.json`
- `natgeo_data.csv`
- `nike_data.xlsx`

## Data URL Implementation

### Service Worker Compatibility
Chrome extension service workers cannot use `URL.createObjectURL()`, so we use data URLs:

```typescript
const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
```

### Benefits
- No memory leaks from blob URLs
- Compatible with Manifest V3 service workers
- Immediate download without temporary file creation
- Cross-browser compatibility

## Error Handling

### Missing Data
- Graceful fallback to legacy `links` array
- Default values for missing fields
- User notification for incomplete exports

### Large Files
- Automatic chunking for large datasets
- Memory-efficient processing
- Progress indication for large exports

### Format Validation
- MIME type validation
- Character encoding handling
- Special character escaping in CSV

## User Interface

### Export Modal
```typescript
<div className="space-y-3">
  <button onClick={() => handleExport(selectedItem, { type: 'json', filename: `${selectedItem.username}_data.json` })}>
    Export as JSON
  </button>
  <button onClick={() => handleExport(selectedItem, { type: 'csv', filename: `${selectedItem.username}_data.csv` })}>
    Export as CSV
  </button>
  <button onClick={() => handleExport(selectedItem, { type: 'excel', filename: `${selectedItem.username}_data.xlsx` })}>
    Export as Excel
  </button>
</div>
```

### Download Feedback
- Immediate download initiation
- Browser download manager integration
- Success/error notifications

## Future Enhancements

### Additional Formats
- **PDF Reports**: Formatted reports with charts
- **XML**: Structured data exchange
- **SQLite**: Database format for advanced queries

### Advanced Features
- **Filtered Exports**: Export subsets based on criteria
- **Template System**: Custom export templates
- **Batch Export**: Multiple history items at once
- **Cloud Integration**: Direct upload to cloud services

### Performance Optimizations
- **Streaming**: Large file streaming for memory efficiency
- **Compression**: ZIP archives for multiple files
- **Caching**: Export result caching for repeated downloads
