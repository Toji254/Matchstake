import React from 'react';
import SwapWidget from '../components/SwapWidget';

const OFFICIAL_RESOURCES = [
  { name: 'OKX DEX Portal', description: 'Swap tokens across multi-chains on X Layer', link: 'https://www.okx.com/web3/dex-swap' },
  { name: 'X Layer Bridge', description: 'Bridge native assets (ETH, USDT) into X Layer', link: 'https://www.okx.com/xlayer/bridge' },
  { name: 'X Layer Testnet Faucet', description: 'Claim testnet OKB tokens for transaction gas', link: 'https://www.okx.com/xlayer/faucet' },
];

export default function Swap() {
  return (
    <main className="page-content">
      {/* Header section */}
      <section className="section-dark" style={{ paddingBottom: 40 }}>
        <div className="section-inner">
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--text-dimmer)',
            marginBottom: 16,
          }}>
            X LAYER // DEX & BRIDGE AGGREGATOR
          </p>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.05,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            SWAP & BRIDGE
          </h1>
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.78rem',
            color: 'var(--text-dim)',
            maxWidth: '52ch',
            lineHeight: 1.7,
          }}>
            Get OKB to stake on your predictions. Route trades via OKX DEX or bridge assets onto the X Layer testnet.
          </p>
        </div>
      </section>

      {/* Widget Section */}
      <section className="section-dark" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="section-inner">
          <SwapWidget />
        </div>
      </section>

      {/* Official Resources Section */}
      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--text-dim)',
            marginBottom: 20,
          }}>
            OFFICIAL X LAYER TRANSACTION GATEWAYS
          </p>
          
          <div className="glass-strong" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>GATEWAY RESOURCE</th>
                  <th>DESCRIPTION</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {OFFICIAL_RESOURCES.map((resource, index) => (
                  <tr key={index}>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {resource.name}
                    </td>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {resource.description}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <a 
                        href={resource.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', padding: '4px 12px', fontSize: '0.68rem' }}
                      >
                        OPEN PORTAL ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <span>MATCHSTAKE © 2026. BUILT FOR OKX X CUP HACKATHON.</span>
        <span>DEPLOYED ON X LAYER</span>
      </footer>
    </main>
  );
}
