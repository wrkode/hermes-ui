import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 30000, // 30 second timeout
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // Format error message based on the error type
    let errorMessage = 'An unknown error occurred';
    
    if (error.response) {
      // The server responded with a status code outside of 2xx range
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 404) {
        errorMessage = 'Resource not found';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (data && data.detail) {
        errorMessage = data.detail;
      } else if (data && data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your connection';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again';
      }
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || 'Error setting up request';
    }
    
    return Promise.reject({
      originalError: error,
      message: errorMessage,
      status: error.response ? error.response.status : null
    });
  }
);

export const ingestFile = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    console.log("Sending single file upload request...");
    const response = await api.post('/ingest/file', formData);
    console.log("Single file upload response:", response.data);
    return {
      success: true,
      file_name: file.name,
      chunks_created: response.data.chunks_created || 0,
      message: response.data.message || 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Ingest file error:', error);
    return {
      success: false,
      file_name: file.name,
      error: error.message || 'Failed to upload file'
    };
  }
};

export const ingestMultipleFiles = async (files, metadata = {}) => {
  try {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    console.log(`Sending multiple files (${files.length}) upload request...`);
    const response = await api.post('/ingest/files', formData);
    console.log("Multiple files upload response:", response.data);
    return {
      success: true,
      file_count: files.length,
      files_processed: response.data.files_processed || 0,
      chunks_created: response.data.chunks_created || 0,
      message: response.data.message || 'Files uploaded successfully'
    };
  } catch (error) {
    console.error('Ingest multiple files error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload files'
    };
  }
};

export const ingestFromUrl = async (url, metadata = {}) => {
  try {
    console.log(`Sending URL ingest request for: ${url}`);
    const response = await api.post('/ingest/url', {
      url,
      metadata: metadata || {}
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("URL ingest response:", response.data);
    return {
      success: true,
      url: url,
      file_name: response.data.file_name || url.split('/').pop(),
      chunks_created: response.data.chunks_created || 0,
      message: response.data.message || 'URL ingested successfully'
    };
  } catch (error) {
    console.error('Ingest from URL error:', error);
    return {
      success: false,
      url: url,
      error: error.message || 'Failed to ingest from URL'
    };
  }
};

export const getStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Get status error:', error);
    // Return a default status object instead of throwing
    return {
      document_count: 'N/A',
      chunk_count: 'N/A',
      status: 'Error',
      error: error.message || 'Failed to fetch status'
    };
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Check health error:', error);
    return { 
      status: 'unhealthy',
      qdrant_status: 'unknown',
      error: error.message
    };
  }
};

export const deleteDocument = async (filename) => {
  try {
    const response = await api.delete(`/document/${filename}`);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Delete document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete document'
    };
  }
};

export default {
  ingestFile,
  ingestMultipleFiles,
  ingestFromUrl,
  getStatus,
  checkHealth,
  deleteDocument,
}; 