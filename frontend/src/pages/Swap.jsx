import React from 'react';
import SwapWidget from '../components/SwapWidget';

const DEMO_SWAPS = [
  { time: '10:14:22', from: '0.1 ETH', to: '5.85 OKB', rate: '1 ETH = 58.5 OKB', status: 'SUCCESS // X LAYER' },
  { time: '09:42:05', from: '50 USDT', to: '0.95 OKB', rate: '1 USDT = 0.019 OKB', status: 'SUCCESS // X LAYER' },
  { time: '08:15:30', from: '100 USDC', to: '1.90 OKB', rate: '1 USDC = 0.019 OKB', status: 'SUCCESS // X LAYER' },
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
            X LAYER // DEX AGGREGATOR
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
            SWAP
          </h1>
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.78rem',
            color: 'var(--text-dim)',
            maxWidth: '52ch',
            lineHeight: 1.7,
          }}>
            Get OKB to stake on your predictions. Powered by OKX DEX.
          </p>
        </div>
      </section>

      {/* Widget Section */}
      <section className="section-dark" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="section-inner">
          <SwapWidget />
        </div>
      </section>

      {/* Recent Swaps Table Section */}
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
            RECENT DEX TRANSACTION LOGS
          </p>
          
          <div className="glass-strong" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>FROM</th>
                  <th>TO</th>
                  <th>RATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_SWAPS.map((swap, index) => (
                  <tr key={index}>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {swap.time}
                    </td>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.82rem', fontWeight: 500 }}>
                      {swap.from}
                    </td>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {swap.to}
                    </td>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {swap.rate}
                    </td>
                    <td style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.05em' }}>
                      {swap.status}
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
