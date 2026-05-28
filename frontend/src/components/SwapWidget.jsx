import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const API_BASE = '/api';

// 1 of each token in OKB value
const RATES = {
  ETH: 58.5,
  USDT: 0.019,
  USDC: 0.019,
  OKB: 1.0,
};

const TOKEN_HINTS = {
  OKB: 'Native X Layer gas & stake asset',
  ETH: 'Native ETH route',
  USDT: 'Stablecoin route',
  USDC: 'Stablecoin route',
};

export default function SwapWidget() {
  const [amountFrom, setAmountFrom] = useState('10');
  const [tokenFrom, setTokenFrom] = useState('OKB');
  const [tokenTo, setTokenTo] = useState('USDT');
  const [isSwapping, setIsSwapping] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState('OKX DEX AUTO-ROUTE');

  // Handle bidirectional token selection
  const handleSelectFrom = (val) => {
    setTokenFrom(val);
    if (val === 'OKB') {
      setTokenTo('USDT');
    } else {
      setTokenTo('OKB');
    }
  };

  const handleSelectTo = (val) => {
    setTokenTo(val);
    if (val === 'OKB') {
      setTokenFrom('USDT');
    } else {
      setTokenFrom('OKB');
    }
  };

  const rate = useMemo(() => {
    if (tokenFrom === 'OKB') {
      // Selling OKB for another asset
      const destRate = RATES[tokenTo] || 1;
      return (1 / destRate);
    } else {
      // Buying OKB with another asset
      return RATES[tokenFrom] || 1;
    }
  }, [tokenFrom, tokenTo]);

  const amountTo = useMemo(() => {
    const parsed = parseFloat(amountFrom);
    if (isNaN(parsed) || parsed <= 0) return '0.00';
    return (parsed * rate).toFixed(4);
  }, [amountFrom, rate]);

  const handleSwap = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
          toToken: tokenTo,
          amount: String(parsed),
          chainId: 195,
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

  const handleTestnetSwap = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const parsed = parseFloat(amountFrom);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('ENTER A VALID AMOUNT TO SWAP');
      return;
    }

    setIsSwapping(true);
    setQuoteStatus('QUERYING X LAYER TESTNET DEX LIQUIDITY...');

    setTimeout(() => {
      setQuoteStatus('OPTIMAL X LAYER TESTNET ROUTE RESOLVED');
      toast.loading('Requesting signature confirmation in wallet...', { duration: 2000 });

      setTimeout(() => {
        setIsSwapping(false);
        const mockTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        toast.success(
          <span>
            Testnet Swap Confirmed! 🔄{' '}
            <a href={`https://www.oklink.com/xlayer-test/tx/${mockTx}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#22c55e', marginLeft: 8, fontWeight: 700 }}>
              [VIEW TX]
            </a>
          </span>,
          { duration: 12000 }
        );
      }, 2000);
    }, 1200);
  };

  const handleBridge = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    toast.loading('Opening official X Layer Bridge...', { duration: 2500 });
    setTimeout(() => {
      window.open('https://www.okx.com/xlayer/bridge', '_blank', 'noopener,noreferrer');
    }, 500);
  };

  return (
    <div className="swap-card glass-strong" style={{ maxWidth: 440, margin: '0 auto', padding: 32 }}>
      <form onSubmit={(e) => e.preventDefault()}>
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
              onChange={(e) => handleSelectFrom(e.target.value)}
              disabled={isSwapping}
              style={{
                width: 110,
                fontFamily: 'var(--font)',
                textTransform: 'uppercase',
                background: 'rgba(0, 0, 0, 0.8)',
                cursor: 'pointer',
              }}
            >
              <option value="OKB">OKB</option>
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
            <span style={{ color: 'var(--text-dimmer)' }}>{TOKEN_HINTS[tokenTo]}</span>
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
            {tokenFrom === 'OKB' ? (
              <select
                className="form-select"
                value={tokenTo}
                onChange={(e) => handleSelectTo(e.target.value)}
                disabled={isSwapping}
                style={{
                  width: 110,
                  fontFamily: 'var(--font)',
                  textTransform: 'uppercase',
                  background: 'rgba(0, 0, 0, 0.8)',
                  cursor: 'pointer',
                }}
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </select>
            ) : (
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
            )}
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
            <span style={{ color: 'var(--fg)' }}>1 {tokenFrom} ≈ {rate.toFixed(4)} {tokenTo}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>ROUTE</span>
            <span style={{ color: 'var(--fg)' }}>{quoteStatus}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSwap}
            disabled={isSwapping}
            style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font)', fontWeight: 700 }}
          >
            {isSwapping ? 'ROUTING...' : `SWAP VIA OKX DEX (MAINNET)`}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTestnetSwap}
            disabled={isSwapping}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontFamily: 'var(--font)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              background: 'rgba(34, 197, 94, 0.08)',
              color: '#22c55e',
              fontWeight: 600,
            }}
          >
            TESTNET SWAP SIMULATOR (DEMO)
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
