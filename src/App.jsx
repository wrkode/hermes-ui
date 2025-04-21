import React, { useState } from 'react';

// Simple components with inline styles
const Dashboard = () => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Service Status</h2>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Documents</h3>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>0</div>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Chunks</h3>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>0</div>
        </div>
      </div>
    </div>
  );
};

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ 
        border: '2px dashed #cbd5e1',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        cursor: 'pointer',
      }} onClick={handleClickUpload}>
        <div style={{ marginBottom: '16px', fontSize: '32px', color: '#64748b' }}>📄</div>
        <p style={{ margin: '0', fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
          Drag and drop your files here
        </p>
        <p style={{ margin: '0', fontSize: '14px', color: '#94a3b8' }}>
          or click to browse files
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple
        />
      </div>
      
      {files.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button 
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            Upload {files.length} File{files.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div style={{ 
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <header style={{ 
        marginBottom: '30px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '24px',
          fontWeight: '700',
          color: '#0f172a',
          margin: '0'
        }}>Hermes UI</h1>
        <p style={{ 
          fontSize: '16px',
          color: '#64748b',
          margin: '8px 0 0 0'
        }}>Document Ingestion for Knowledge Bases</p>
      </header>
      
      <section style={{ 
        marginBottom: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#0f172a',
          margin: '0 0 16px 0'
        }}>Service Status</h2>
        <Dashboard />
      </section>
      
      <section style={{ 
        marginBottom: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#0f172a',
          margin: '0 0 16px 0'
        }}>Upload Documents</h2>
        <FileUpload />
      </section>
    </div>
  );
}

export default App; 