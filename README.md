# Hermes UI

A modern and responsive Web UI for the Hermes Ingestor service. This interface allows users to upload documents for processing and ingestion into knowledge bases.

## Features

- Drag & drop file uploads
- Multiple file selection and batch uploads
- URL-based document ingestion
- Real-time service status dashboard
- Modern, responsive design

## Prerequisites

- Node.js (>= 14.x)
- npm or yarn
- Hermes Ingestor service running

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   ./start.sh
   ```
   This will start the UI on http://localhost:3000.

**Note:** Make sure the Hermes Ingestor service is running on http://localhost:8000.

## Building for Production

To build the project for production deployment:

```
npm run build
```

This will create a `dist` directory with production-ready static files.

## Docker

To build a Docker image:

```
docker build -t hermes-ui .
```

To run the Docker container:

```
docker run -p 80:80 hermes-ui
```

## Kubernetes Deployment

Kubernetes manifests are located in the `k8s` directory. To deploy to Kubernetes:

1. First, build and push the Docker image to your registry:
   ```
   docker build -t ${DOCKER_REGISTRY}/hermes-ui:latest .
   docker push ${DOCKER_REGISTRY}/hermes-ui:latest
   ```

2. Apply the Kubernetes manifests:
   ```
   kubectl apply -f k8s/deployment.yaml
   ```

3. Access the UI through the configured Ingress or port-forward to the service:
   ```
   kubectl port-forward svc/hermes-ui 8080:80
   ```
   Then access the UI at http://localhost:8080

## Configuration

The UI is configured to connect to the Hermes Ingestor API at `/api` by default. This is proxied to the backend service by either:

- The webpack dev server during development
- Nginx in the production Docker image
- Kubernetes service routing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 