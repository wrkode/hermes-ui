#!/bin/bash
set -e

# Colorful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Check node version (needs to be 16+)
NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 16 ]; then
    log_warning "Node.js version is $NODE_VERSION. Hermes UI works best with Node.js 16 or higher."
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm to continue."
    exit 1
fi

# Make sure we're in the hermes-ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        log_error "Failed to install dependencies. Please check your npm configuration and try again."
        exit 1
    fi
    log_success "Dependencies installed successfully."
fi

# Check if backend service is running
log_info "Checking if Hermes Ingestor service is running..."
if curl -s http://localhost:8000/api/health > /dev/null; then
    log_success "Hermes Ingestor service is running on http://localhost:8000"
else
    log_warning "Hermes Ingestor service does not appear to be running."
    log_info "You can start it with: cd ../hermes-ingestor && docker-compose up"
    
    read -p "Do you want to continue without the backend service? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Exiting, please start the backend service and try again."
        exit 0
    fi
fi

# Set environment variables
export REACT_APP_API_URL=http://localhost:8000/api

# Start the development server
log_info "Starting Hermes UI on http://localhost:3000"
npm start 