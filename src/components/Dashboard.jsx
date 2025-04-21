import React, { useEffect, useState } from 'react';
import { getStatus, checkHealth } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [status, setStatus] = useState({ document_count: '?', chunk_count: '?', status: 'Unknown' });
  const [health, setHealth] = useState({ status: 'unknown', qdrant_status: 'unknown' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch health status
        const healthData = await checkHealth();
        setHealth(healthData);
        
        // Fetch service status
        const statusData = await getStatus();
        setStatus(statusData);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching service data:', err);
        setError('Failed to fetch service status. Please make sure the Hermes Ingestor service is running.');
        // Don't update status/health state here to keep the fallback values
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch data immediately
    fetchData();
    
    // Set up polling interval
    const intervalId = setInterval(fetchData, 20000); // Poll every 20 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diff = now - lastUpdated;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else {
      return lastUpdated.toLocaleTimeString();
    }
  };

  const handleRefresh = async () => {
    // Manual refresh
    setLoading(true);
    setError(null);
    
    try {
      const healthData = await checkHealth();
      setHealth(healthData);
      
      const statusData = await getStatus();
      setStatus(statusData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {loading && <div className="dashboard-loading">Loading service status...</div>}
      
      {error && <div className="dashboard-error">{error}</div>}
      
      <div className="dashboard-header">
        <div className="health-indicator">
          <div className={`health-dot ${health.status === 'healthy' ? 'healthy' : 'unhealthy'}`}></div>
          <span className={`health-text ${health.status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
            Hermes Ingestor Service: {health.status || 'unknown'}
            {health.qdrant_status !== 'healthy' && ` (Qdrant: ${health.qdrant_status || 'unknown'})`}
          </span>
        </div>
        
        <div className="dashboard-actions">
          <span className="last-updated">Last updated: {formatLastUpdated()}</span>
          <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="status-grid">
        <div className="status-card">
          <h3 className="card-title">Documents</h3>
          <div className="card-value">{status.document_count}</div>
        </div>
        
        <div className="status-card">
          <h3 className="card-title">Chunks</h3>
          <div className="card-value">{status.chunk_count}</div>
        </div>
        
        <div className="status-card">
          <h3 className="card-title">Service Status</h3>
          <div className="card-value">{status.status}</div>
        </div>
        
        {status.memory_usage && (
          <div className="status-card">
            <h3 className="card-title">Memory Usage</h3>
            <div className="card-value">{status.memory_usage}</div>
          </div>
        )}
      </div>
      
      {health.version && (
        <div className="version-info">
          Hermes Ingestor version: {health.version}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 