import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#070A10',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#161C28',
            border: '1px solid #FF4D4D',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '480px',
            width: '100%'
          }}>
            <h2 style={{ color: '#FF4D4D', margin: '0 0 10px 0', fontSize: '18px' }}>
              Terminal Encountered an Error
            </h2>
            <p style={{ color: '#8E99AE', fontSize: '13px', margin: '0 0 16px 0', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#00D1FF',
                color: '#0D121D',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
