import React, { useRef, useState, useCallback } from 'react';
import { ingestFile, ingestMultipleFiles, ingestFromUrl } from '../services/api';
import '../styles/FileUpload.css';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  'application/pdf', 
  'text/plain', 
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

const FileUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, reason: `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}` };
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      return { valid: false, reason: 'File type not supported. Supported formats include PDF, TXT, DOCX, and MD.' };
    }
    
    return { valid: true };
  }, []);
  
  const simulateProgress = useCallback(() => {
    // Simulate upload progress
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        // Slowly increase to 90%, the real completion will be set once upload finishes
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + (90 - prev) / 10;
      });
    }, 500);
    
    setProgressInterval(interval);
    return interval;
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles) => {
    setError(null);
    const fileArray = Array.from(newFiles);
    
    // Validate each file
    const invalidFiles = fileArray.map(file => {
      const validation = validateFile(file);
      return {
        file,
        valid: validation.valid,
        reason: validation.reason || null
      };
    }).filter(item => !item.valid);
    
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} file(s) cannot be uploaded: ${invalidFiles.map(f => `${f.file.name} (${f.reason})`).join(', ')}`);
      // Filter out invalid files
      const validFiles = fileArray.filter(file => validateFile(file).valid);
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    } else {
      setFiles(prevFiles => [...prevFiles, ...fileArray]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) return;
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    const interval = simulateProgress();
    
    try {
      const result = await ingestFromUrl(url);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      setUrl('');
    } catch (error) {
      console.error('Error ingesting from URL:', error);
      setError(`Failed to ingest from URL: ${error.message || 'Unknown error'}`);
      
      if (onUploadComplete) {
        onUploadComplete({
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    const interval = simulateProgress();
    
    try {
      let result;
      
      if (files.length === 1) {
        // Single file upload
        result = await ingestFile(files[0]);
      } else {
        // Multiple files upload
        result = await ingestMultipleFiles(files);
      }
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      // Reset files
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message || 'Unknown error'}`);
      
      if (onUploadComplete) {
        onUploadComplete({
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    } finally {
      setIsUploading(false);
      
      // Clear progress bar after 1 second
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const renderProgress = () => {
    if (uploadProgress === 0) return null;
    
    return (
      <div className="upload-progress-container">
        <div className="upload-progress-bar">
          <div 
            className="upload-progress-fill" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <div className="upload-progress-text">{Math.round(uploadProgress)}%</div>
      </div>
    );
  };

  return (
    <div className="upload-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    
      <div 
        className={`drop-zone ${isDragActive ? 'active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <div className="upload-icon">📄</div>
        <p className="upload-text">Drag and drop your files here</p>
        <p className="upload-subtext">or click to browse files</p>
        <p className="upload-formats">Supported formats: PDF, TXT, DOCX, MD</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          multiple
          accept=".pdf,.txt,.docx,.doc,.md"
        />
      </div>
      
      <div className="url-container">
        <input
          type="text"
          className="url-input"
          placeholder="Enter a URL to ingest..."
          value={url}
          onChange={handleUrlChange}
        />
        <button 
          className="upload-button" 
          onClick={handleUrlSubmit}
          disabled={isUploading || !url}
        >
          {isUploading ? 'Fetching...' : 'Fetch URL'}
        </button>
      </div>
      
      {renderProgress()}
      
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <span>Selected Files ({files.length})</span>
            <button 
              className="clear-all-button"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear All
            </button>
          </div>
          
          {files.map((file, index) => (
            <div className="file-item" key={`${file.name}-${index}`}>
              <div className="file-icon">
                {file.type === 'application/pdf' && '📑'}
                {file.type === 'text/plain' && '📝'}
                {file.type.includes('word') && '📄'}
                {!['application/pdf', 'text/plain'].includes(file.type) && !file.type.includes('word') && '📁'}
              </div>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <button 
                className="remove-button"
                onClick={() => handleRemoveFile(index)}
                disabled={isUploading}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      
      {files.length > 0 && (
        <button
          className="upload-button upload-files-button"
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

export default FileUpload; 