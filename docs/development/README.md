# Development Guide

This guide describes how to set up and work with the Hermes UI development environment.

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- Git
- A code editor (VS Code recommended)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hermes-ingest.git
   cd hermes-ingest/hermes-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
hermes-ui/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Write tests
4. Submit a pull request

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint
```

## TypeScript

The project uses TypeScript for type safety. Key points:

- Use strict type checking
- Define interfaces for all props
- Use type guards when necessary
- Avoid `any` type

## State Management

We use React Context for state management:

- `AuthContext` - Authentication state
- `UploadContext` - File upload state
- `SettingsContext` - User settings

## API Integration

See the [API Integration Guide](api/README.md) for details on integrating with the backend.

## Performance

Best practices for performance:

1. Use React.memo for expensive components
2. Implement proper code splitting
3. Optimize bundle size
4. Use proper caching strategies

## Debugging

1. Use React Developer Tools
2. Enable source maps
3. Use the browser's dev tools
4. Check the console for errors

## Common Issues

1. CORS errors
2. Type errors
3. Build failures
4. Test failures 