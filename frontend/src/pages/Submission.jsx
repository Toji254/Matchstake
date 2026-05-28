import React from 'react';
import {
  CONTRACT_ADDRESS,
  NFT_ADDRESS,
  V4_POOLMANAGER_ADDRESS,
  V4_HOOK_ADDRESS,
  V4_POOL_CURRENCY0,
  V4_POOL_CURRENCY1,
  V4_HOOK_DEPLOY_TX,
  V4_POOL_INIT_TX,
} from '../config/contract';
import { TARGET_CHAIN } from '../config/wagmi';

const checklist = [
  ['World Cup theme', 'Prediction rooms, watch parties, squads, dynamic ticket NFTs'],
  ['X Layer deployment', 'Contracts deployable via demo.sh; frontend guarded to X Layer Testnet'],
  ['Exchange OS (Sandbox)', 'Conceptual market venue deployer mapping upcoming institutional matching specs'],
  ['Onchain OS integration', 'Fully integrated OKX Onchain OS Skills framework supporting real CLI commands, wallet portfolio querying, aggregated DEX swaps, and payment dispatcher protocols.'],
  ['Prediction market / SocialFi', 'Private pools, friend invites, score staking, transparent payouts'],
  ['Trading', 'OKX DEX aggregator swap routing for OKB liquidity on X Layer'],
  ['NFT / GameFi', 'Proof-of-prediction LiveHype NFTs and squad leaderboard'],
  ['AI Agent', 'Score agent with confidence, stake recommendation, Onchain OS action console'],
  ['Uniswap V4 Hook', 'FanLiquidityHook: AI dynamic fees, social multipliers, NFT sync'],
  ['Market potential', 'Viral share cards, public challenge page, X/Twitter post drafts'],
  ['Completion proof', 'README, scripts, contract addresses, demo tour route'],
];

export default function Submission() {
  const explorer = TARGET_CHAIN.blockExplorers.default.url;
  const matchstakeUrl = `${explorer}/address/${CONTRACT_ADDRESS}`;
  const nftUrl = `${explorer}/address/${NFT_ADDRESS}`;
  const v4PoolManagerUrl = `${explorer}/address/${V4_POOLMANAGER_ADDRESS}`;
  const v4HookUrl = `${explorer}/address/${V4_HOOK_ADDRESS}`;
  const v4HookTxUrl = `${explorer}/tx/${V4_HOOK_DEPLOY_TX}`;
  const v4InitTxUrl = `${explorer}/tx/${V4_POOL_INIT_TX}`;
  const v4Currency1Url = `${explorer}/address/${V4_POOL_CURRENCY1}`;

  return (
    <main className="page-content">
      <section className="section-dark" style={{ paddingBottom: 40 }}>
        <div className="section-inner">
          <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-dimmer)', marginBottom: 16 }}>
            OKX X CUP // JUDGE PACK
          </p>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(34px, 6vw, 72px)', fontWeight: 800, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.04em' }}>
            Submission proof room
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', lineHeight: 1.8, maxWidth: '76ch', marginTop: 18 }}>
            A single page for judges: requirements mapping, deployed-address slots, demo links, social post copy, and the Uniswap V4 hook contingency plan.
          </p>
        </div>
      </section>

      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="submission-grid">
            <div className="glass-strong" style={{ padding: 28 }}>
              <span className="badge-demo">REQUIREMENT MAP</span>
              <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                {checklist.map(([label, detail], i) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 14, padding: '14px 0', borderTop: '1px solid var(--border-light)' }}>
                    <strong style={{ color: 'var(--gold)' }}>{String(i + 1).padStart(2, '0')}</strong>
                    <div>
                      <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.08em' }}>{label}</div>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', lineHeight: 1.7, marginTop: 4 }}>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-strong" style={{ padding: 28 }}>
              <span className="badge-demo">ON-CHAIN PROOF</span>
              <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                <div className="proof-row"><span>Target chain</span><strong>{TARGET_CHAIN.name} ({TARGET_CHAIN.id})</strong></div>
                <div className="proof-row"><span>MatchStake</span><a href={matchstakeUrl} target="_blank" rel="noreferrer">{CONTRACT_ADDRESS}</a></div>
                <div className="proof-row"><span>Prediction NFT</span><a href={nftUrl} target="_blank" rel="noreferrer">{NFT_ADDRESS}</a></div>
                <div className="proof-row"><span>Uniswap v4 PoolManager</span><a href={v4PoolManagerUrl} target="_blank" rel="noreferrer">{V4_POOLMANAGER_ADDRESS}</a></div>
                <div className="proof-row"><span>Uniswap v4 Hook</span><a href={v4HookUrl} target="_blank" rel="noreferrer">{V4_HOOK_ADDRESS}</a></div>
                <div className="proof-row"><span>v4 hook deploy tx</span><a href={v4HookTxUrl} target="_blank" rel="noreferrer">{V4_HOOK_DEPLOY_TX}</a></div>
                <div className="proof-row"><span>v4 pool init tx</span><a href={v4InitTxUrl} target="_blank" rel="noreferrer">{V4_POOL_INIT_TX}</a></div>
                <div className="proof-row"><span>v4 pool currency0</span><strong>{V4_POOL_CURRENCY0} (native OKB)</strong></div>
                <div className="proof-row"><span>v4 pool currency1</span><a href={v4Currency1Url} target="_blank" rel="noreferrer">{V4_POOL_CURRENCY1}</a></div>
                <div className="proof-row"><span>Demo route</span><a href="/?demo=true">/?demo=true</a></div>
                <div className="proof-row"><span>Share route</span><a href="/share/1">/share/1</a></div>
              </div>

              <div style={{ marginTop: 28, padding: 18, border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Custom Uniswap V4 Hook</div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.74rem', lineHeight: 1.7 }}>
                  MatchStake includes a real Uniswap v4 hook deployment on X Layer Testnet. The hook implements v4 swap callbacks to support AI-managed dynamic fees and after-swap fan-credit accounting, wired to a v4 pool with native OKB (currency0 = address(0)). See the PoolManager + Hook + init tx links above for verifiable on-chain proof.
                </p>
              </div>

              <a className="btn btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} href="https://twitter.com/intent/tweet?text=Building%20MatchStake%20for%20the%20OKX%20X%20Cup%20on%20%40XLayerOfficial%3A%20World%20Cup%20watch%20party%20prediction%20pools%2C%20AI%20agent%2C%20OKX%20DEX%2C%20dynamic%20NFTs%2C%20and%20squad%20GameFi.%20%40Uniswap%20%40flapdotsh%20%23WorldCup2026%20%23MatchStake" target="_blank" rel="noreferrer">
                DRAFT SUBMISSION X POST
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
