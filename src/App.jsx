import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  const [uploadResult, setUploadResult] = useState(null);

  const handleUploadComplete = (result) => {
    console.log("Upload complete callback received:", result); // Log the result
    setUploadResult(result); // Set the entire result object
    
    // Clear the result message after 5 seconds
    setTimeout(() => setUploadResult(null), 5000);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Hermes Document</h1>
        <p className="app-subtitle">Document Ingestion Service for Hermes Knowledge Bases</p>
      </header>
      
      <section className="app-section">
        <h2 className="section-title">Service Status</h2>
        <Dashboard />
      </section>
      
      <section className="app-section">
        <h2 className="section-title">Upload Documents</h2>
        <FileUpload onUploadComplete={handleUploadComplete} />
        
        {uploadResult && (
          <div className={`upload-feedback ${uploadResult.success ? 'success' : 'error'}`}>
            {uploadResult.success
              ? uploadResult.message || `Successfully processed ${uploadResult.file_name || uploadResult.url || 'item'}!`
              : `Upload failed: ${uploadResult.error || 'Unknown reason'}`
            }
            {uploadResult.chunks_created !== undefined && uploadResult.success &&
              ` Created ${uploadResult.chunks_created} chunks.`
            }
          </div>
        )}
      </section>
    </div>
  );
}

export default App; 