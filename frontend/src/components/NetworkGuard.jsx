import React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { TARGET_CHAIN, TARGET_CHAIN_ID } from '../config/wagmi';

/**
 * NetworkGuard — Renders a banner when the user is connected but on the wrong chain.
 */
export default function NetworkGuard() {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  // If not connected, nothing to show
  if (!isConnected) return null;

  const isWrongChain = !chain || chain.id !== TARGET_CHAIN_ID;

  // Banner: wrong network
  if (isWrongChain) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: 'rgba(239, 68, 68, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#fff',
        padding: '12px 24px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        textAlign: 'center',
        lineHeight: 1.6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        borderTop: '1px solid rgba(255,255,255,0.2)',
      }}>
        <span>
          <strong>⚠ WRONG NETWORK</strong> — You are on <strong>{chain?.name || 'Unsupported Network'}</strong>.
          MatchStake requires <strong>{TARGET_CHAIN.name}</strong> (Chain ID {TARGET_CHAIN_ID}).
        </span>
        <button
          onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
          disabled={isPending}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '6px 16px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: isPending ? 'wait' : 'pointer',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {isPending ? 'SWITCHING...' : 'SWITCH NETWORK'}
        </button>
      </div>
    );
  }

  return null;
}
