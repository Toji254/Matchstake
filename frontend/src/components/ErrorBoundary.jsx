import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main 
          className="room-container" 
          style={{ 
            textAlign: 'center', 
            paddingTop: '160px', 
            paddingBottom: '160px',
            maxWidth: '560px',
            margin: '0 auto'
          }}
        >
          <div className="glass-strong" style={{ padding: '60px 40px', border: '1px solid var(--border-light)' }}>
            <h1 style={{
              fontFamily: 'var(--font-head)',
              fontSize: '2rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 16,
              color: 'var(--fg)',
            }}>
              SYSTEM ERROR
            </h1>
            <p style={{
              fontFamily: 'var(--font)',
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              lineHeight: 1.8,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 32,
              wordBreak: 'break-word',
            }}>
              {this.state.error && this.state.error.toString()}
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
              style={{ display: 'inline-flex', justifyContent: 'center', minWidth: 160 }}
            >
              RELOAD
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
