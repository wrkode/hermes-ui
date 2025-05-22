# API Integration Guide

This guide describes how the Hermes UI integrates with the Hermes Ingestor API.

## API Endpoints

The UI interacts with the following Ingestor API endpoints:

- `POST /upload` - File upload endpoint
- `GET /status/{file_id}` - Status checking endpoint
- `POST /ingest-url` - URL-based ingestion endpoint

## Authentication

The UI uses API key authentication to communicate with the Ingestor service. The API key should be configured in the environment variables:

```env
REACT_APP_API_KEY=your_api_key_here
```

## Error Handling

The UI implements comprehensive error handling for API interactions:

- Network errors
- Authentication failures
- Rate limiting
- File processing errors

## Real-time Updates

The UI implements real-time status updates using polling:

1. After file upload, the UI polls the status endpoint
2. Updates are displayed in real-time
3. Processing errors are handled gracefully

## Example Usage

```typescript
// Example API integration code
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/upload', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.REACT_APP_API_KEY
    },
    body: formData
  });
  
  return response.json();
};
```

## Best Practices

1. Always include the API key in requests
2. Handle rate limiting gracefully
3. Implement proper error handling
4. Use appropriate content types
5. Follow security best practices 