# Deployment Guide

This guide describes how to deploy the Hermes UI service.

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- Docker (optional)
- Kubernetes (optional)

## Environment Variables

Configure the following environment variables:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_KEY=your_api_key_here
```

## Development Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Production Build

1. Create a production build:
   ```bash
   npm run build
   ```

2. The build output will be in the `build/` directory

## Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t hermes-ui .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:80 hermes-ui
   ```

## Kubernetes Deployment

1. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/
   ```

2. The UI will be available at the configured ingress endpoint

## Nginx Configuration

Example Nginx configuration for serving the UI:

```nginx
server {
    listen 80;
    server_name ui.hermes.local;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://ingestor:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring

The UI includes:

- Error tracking
- Performance monitoring
- User analytics
- API health checks

## Backup and Recovery

1. Back up the build artifacts
2. Store environment variables securely
3. Document deployment configurations

## Troubleshooting

Common issues and solutions:

1. CORS errors
2. API connectivity issues
3. Build failures
4. Deployment problems 