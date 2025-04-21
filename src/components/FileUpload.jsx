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
    console.log("Drag Enter");
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent flickering when dragging over child elements
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    console.log("Drag Leave");
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Drag Over"); // Can be very noisy
    if (!isDragActive) setIsDragActive(true); // Ensure active state is set
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Drop event fired");
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log(`Dropped ${e.dataTransfer.files.length} file(s)`);
      handleFiles(e.dataTransfer.files);
    } else {
      console.log("No files found in drop event dataTransfer");
    }
  };

  const handleFileInputChange = (e) => {
    console.log("File input changed");
    if (e.target.files && e.target.files.length > 0) {
      console.log(`Selected ${e.target.files.length} file(s) via input`);
      handleFiles(e.target.files);
    } else {
      console.log("No files selected via input");
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = null;
  };

  const handleFiles = (newFiles) => {
    setError(null);
    console.log("handleFiles received:", newFiles);
    const fileArray = Array.from(newFiles);
    console.log(`Converted to array, ${fileArray.length} file(s):`, fileArray.map(f => f.name));
    
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
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...validFiles];
        console.log("Updated files state:", updatedFiles.map(f => f.name));
        return updatedFiles;
      });
    } else {
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...fileArray];
        console.log("Updated files state:", updatedFiles.map(f => f.name));
        return updatedFiles;
      });
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
    console.log(`Attempting to ingest URL: ${url}`);
    
    const interval = simulateProgress();
    
    try {
      const result = await ingestFromUrl(url);
      console.log("URL Ingest API Result:", result);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      if(result.success) {
        setUrl('');
      } else {
        setError(result.error || 'Failed to ingest URL');
      }
    } catch (error) {
      console.error('Fallback Error ingesting from URL:', error);
      setError(`Failed to ingest from URL: ${error.message || 'Unknown error'}`);
      if (onUploadComplete) {
        onUploadComplete({ success: false, error: error.message || 'Unknown error' });
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
    console.log(`Attempting to upload ${files.length} file(s)`);
    
    const interval = simulateProgress();
    
    try {
      let result;
      
      if (files.length === 1) {
        console.log(`Uploading single file: ${files[0].name}`);
        result = await ingestFile(files[0]);
      } else {
        console.log(`Uploading multiple files: ${files.map(f => f.name).join(', ')}`);
        result = await ingestMultipleFiles(files);
      }
      
      console.log("File Upload API Result:", result);
      clearInterval(interval);
      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      if(result.success) {
        setFiles([]);
      } else {
        setError(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Fallback Error during file upload:', error);
      setError(`Upload failed: ${error.message || 'Unknown error'}`);
      if (onUploadComplete) {
        onUploadComplete({ success: false, error: error.message || 'Unknown error' });
      }
    } finally {
      setIsUploading(false);
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