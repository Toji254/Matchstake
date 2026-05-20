import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import AsciiCanvas from '../components/AsciiCanvas';
import { heroConfig, navigationConfig } from '../config/siteConfig';

export default function Hero() {
  const notes = heroConfig.supportingNotes.slice(0, 3);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section id="hero" className="hero-split">
      {/* Global Navigation — spans across both split panels */}
      <nav className="hero-nav">
        <Link to="/" className="hero-nav-brand">
          {navigationConfig.brandName}
        </Link>

        {/* Mobile hamburger toggle */}
        <button
          className="hero-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`hero-nav-right ${mobileMenuOpen ? 'hero-nav-right--open' : ''}`}>
          <div className="hero-nav-links">
            {navigationConfig.links.map((item, index) => (
              <React.Fragment key={`${item.label}-${item.href}`}>
                <Link
                  to={item.href}
                  className="hero-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {index < navigationConfig.links.length - 1 && (
                  <span className="hero-nav-sep">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Wallet Button */}
          {isConnected ? (
            <button
              className="wallet-btn wallet-connected"
              onClick={() => disconnect()}
            >
              ● {shortAddr}
            </button>
          ) : (
            <button
              className="wallet-btn"
              onClick={() => connect({ connector: injected() })}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      <div className="hero-left">
        {/* Hero content */}
        <div className="hero-content">
          <p className="hero-eyebrow">{heroConfig.eyebrow}</p>
          <h1 className="hero-title">
            {heroConfig.titleLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < heroConfig.titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="hero-lead">{heroConfig.leadText}</p>

          <div className="hero-notes">
            {notes.map((note, index) => (
              <p key={index} className="hero-note">
                {note}
              </p>
            ))}
          </div>

          <div className="hero-actions">
            <Link to="/matches" className="btn btn-primary">
              Browse Matches
            </Link>
            <a href="#facilities" className="btn btn-secondary">
              Host Stadiums
            </a>
            <span className="badge-demo" style={{ marginLeft: '4px' }}>
              ⬡ BUILT ON X LAYER
            </span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <AsciiCanvas />
      </div>
    </section>
  );
}
