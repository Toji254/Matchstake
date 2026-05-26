import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const API_BASE = '/api';

const RATES = {
  ETH: 58.5,
  USDT: 0.019,
  USDC: 0.019,
};

const TOKEN_HINTS = {
  ETH: 'Native ETH route',
  USDT: 'Stablecoin route',
  USDC: 'Stablecoin route',
};

export default function SwapWidget() {
  const [amountFrom, setAmountFrom] = useState('1');
  const [tokenFrom, setTokenFrom] = useState('ETH');
  const [isSwapping, setIsSwapping] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState('OKX DEX AUTO-ROUTE');

  const amountTo = useMemo(() => {
    const parsed = parseFloat(amountFrom);
    if (isNaN(parsed) || parsed <= 0) return '0.00';
    const rate = RATES[tokenFrom] || 0;
    return (parsed * rate).toFixed(4);
  }, [amountFrom, tokenFrom]);

  const handleSwap = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amountFrom);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('ENTER A VALID AMOUNT TO SWAP');
      return;
    }

    setIsSwapping(true);
    setQuoteStatus('CHECKING LOCAL QUOTE SERVICE...');

    try {
      const response = await fetch(`${API_BASE}/swap/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken: tokenFrom,
          toToken: 'OKB',
          amount: String(parsed),
          chainId: 196,
        }),
      });

      if (response.ok) {
        setQuoteStatus('LIVE QUOTE SERVICE RESPONDED');
        toast.success('Quote service online. Opening OKX DEX for execution...', { duration: 3000 });
      } else {
        setQuoteStatus('FALLBACK: OPEN OKX DEX');
        toast('Quote unavailable locally. Opening OKX DEX fallback...', { duration: 3000 });
      }
    } catch (_) {
      setQuoteStatus('FALLBACK: OPEN OKX DEX');
      toast('Backend offline. Opening OKX DEX fallback...', { duration: 3000 });
    } finally {
      setTimeout(() => {
        window.open('https://www.okx.com/web3/dex-swap', '_blank', 'noopener,noreferrer');
        setIsSwapping(false);
      }, 700);
    }
  };

  const handleBridge = (e) => {
    e.preventDefault();
    toast.loading('Opening official X Layer Bridge...', { duration: 2500 });
    setTimeout(() => {
      window.open('https://www.okx.com/xlayer/bridge', '_blank', 'noopener,noreferrer');
    }, 500);
  };

  return (
    <div className="swap-card glass-strong" style={{ maxWidth: 440, margin: '0 auto', padding: 32 }}>
      <form onSubmit={handleSwap}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FROM</span>
            <span style={{ color: 'var(--text-dimmer)' }}>{TOKEN_HINTS[tokenFrom]}</span>
          </label>
          <div className="swap-input-container" style={{ display: 'flex', gap: 12 }}>
            <input
              type="number"
              step="any"
              min="0"
              className="form-input"
              value={amountFrom}
              onChange={(e) => setAmountFrom(e.target.value)}
              placeholder="0.0"
              disabled={isSwapping}
              style={{ flex: 1, fontFamily: 'var(--font)' }}
            />
            <select
              className="form-select"
              value={tokenFrom}
              onChange={(e) => setTokenFrom(e.target.value)}
              disabled={isSwapping}
              style={{
                width: 110,
                fontFamily: 'var(--font)',
                textTransform: 'uppercase',
                background: 'rgba(0, 0, 0, 0.8)',
                cursor: 'pointer',
              }}
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-dim)' }}>
          <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font)', display: 'inline-block' }}>↓</span>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>TO</span>
            <span style={{ color: 'var(--text-dimmer)' }}>X LAYER GAS + STAKING TOKEN</span>
          </label>
          <div className="swap-input-container" style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              className="form-input"
              value={amountTo}
              readOnly
              style={{
                flex: 1,
                fontFamily: 'var(--font)',
                background: 'rgba(255, 255, 255, 0.01)',
                color: 'var(--text-dim)',
                cursor: 'not-allowed',
              }}
            />
            <div
              className="form-input"
              style={{
                width: 110,
                fontFamily: 'var(--font)',
                textTransform: 'uppercase',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--fg)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              OKB
            </div>
          </div>
        </div>

        <div
          style={{
            margin: '20px 0 28px',
            padding: '12px 16px',
            border: '1px solid var(--border-light)',
            background: 'rgba(255, 255, 255, 0.01)',
            fontFamily: 'var(--font)',
            fontSize: '0.68rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>EST. RATE</span>
            <span style={{ color: 'var(--fg)' }}>1 {tokenFrom} ≈ {RATES[tokenFrom]} OKB</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>ROUTE</span>
            <span style={{ color: 'var(--fg)' }}>{quoteStatus}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSwapping}
            style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font)' }}
          >
            {isSwapping ? 'ROUTING SWAP...' : 'SWAP VIA OKX DEX'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBridge}
            disabled={isSwapping}
            style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font)' }}
          >
            BRIDGE TO X LAYER
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.58rem',
            color: 'var(--text-dimmer)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1.5,
          }}>
            INTEGRATED WITH LOCAL QUOTE API + OKX DEX EXECUTION FALLBACK
          </p>
          <p style={{
            fontFamily: 'var(--font)',
            fontSize: '0.58rem',
            color: 'var(--text-dimmer)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            USE OKX WALLET OR BRIDGE FUNDS BEFORE STAKING ON X LAYER
          </p>
        </div>
      </form>
    </div>
  );
}
