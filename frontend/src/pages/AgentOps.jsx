import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AgentActionConsole from '../components/AgentActionConsole';

export default function AgentOps() {
  const [activeTab, setActiveTab] = useState('exchange-os');
  
  // Exchange OS Form State
  const [venueName, setVenueName] = useState('MatchStake World Cup Arena');
  const [outcomeAsset, setOutcomeAsset] = useState('Argentina vs France — Win Outcome');
  const [oracleProvider, setOracleProvider] = useState('Chainlink / OKLink API Multi-Sig');
  const [matchingMode, setMatchingMode] = useState('Limit Order Book (Institutional Matching)');
  const [feePercentage, setFeePercentage] = useState('0.5');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedVenues, setDeployedVenues] = useState([
    {
      id: 1,
      name: 'MatchStake France vs Germany',
      asset: 'Outcome: France Win / Draw / Germany Win',
      address: '0x1c8b3f7f89d30A756C93C790D78AaB382F19E92d',
      txHash: '0x9d4a...e188',
      fee: '0.5%',
      status: 'ACTIVE'
    }
  ]);

  // Onchain OS Skills State
  const [skills, setSkills] = useState([
    { name: 'okx/onchainos-dex-aggregator', description: 'Routes swaps via OKX DEX with lowest slippage.', active: true },
    { name: 'okx/onchainos-nlp-engine', description: 'Parses natural language staking commands.', active: true },
    { name: 'okx/onchainos-x402-zero-gas', description: 'Implements gas-free voucher signatures for agent actions.', active: true },
    { name: 'okx/onchainos-realtime-telemetry', description: 'Monitors live goal/hype signals for dynamic NFT morphing.', active: false },
  ]);

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('Bet 0.1 OKB on Argentina to win');
  const [compiledPayload, setCompiledPayload] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Uniswap v4 Hook State
  const [hookRoomId, setHookRoomId] = useState('1');
  const [volatilityIndex, setVolatilityIndex] = useState('760');
  const [upsetRiskCoeff, setUpsetRiskCoeff] = useState('210');
  const [varGatedSwap, setVarGatedSwap] = useState(false);
  const [socialMultiplier, setSocialMultiplier] = useState('12500');
  const [isHookDeploying, setIsHookDeploying] = useState(false);
  const [deployedHooks, setDeployedHooks] = useState([
    {
      id: 1,
      roomId: '1',
      address: '0x48fB3A2C8d8101a91be28D89C790daF382F19e8D',
      volatility: '760',
      risk: '210',
      fee: '0.50% (Surge Override)',
      gated: 'FALSE',
      txHash: '0x0f73...a331'
    }
  ]);

  // Deploy Outcome Venue handler
  const handleDeployVenue = (e) => {
    e.preventDefault();
    if (!venueName.trim() || !outcomeAsset.trim()) {
      toast.error('Venue Name and Outcome Asset are required!');
      return;
    }
    
    setIsDeploying(true);
    toast.loading('Deploying prediction market via Exchange OS Core Engine to X Layer...');
    
    setTimeout(() => {
      toast.dismiss();
      const mockAddr = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('').slice(0, 8) + '...' + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const newVenue = {
        id: Date.now(),
        name: venueName,
        asset: outcomeAsset,
        address: mockAddr,
        txHash: mockTx,
        fee: `${feePercentage}%`,
        status: 'ACTIVE'
      };

      setDeployedVenues(prev => [newVenue, ...prev]);
      setIsDeploying(false);
      toast.success('Exchange OS Outcome Market Venue deployed to X Layer Testnet! 🚀');
    }, 2000);
  };

  // Compile Natural Language handler
  const handleCompileCommand = (e) => {
    e.preventDefault();
    if (!naturalLanguageInput.trim()) return;

    setIsCompiling(true);
    setTimeout(() => {
      const text = naturalLanguageInput.toLowerCase();
      let actionType = 'STAKE';
      let asset = 'OKB';
      let amount = '0.1';
      let details = 'Argentina Win';

      if (text.includes('swap') || text.includes('dex')) {
        actionType = 'SWAP';
        asset = 'USDT -> OKB';
        amount = text.match(/\d+(\.\d+)?/)?.[0] || '10';
        details = 'Routing optimal route via OKX DEX Aggregator';
      } else if (text.includes('nft') || text.includes('mint')) {
        actionType = 'MINT_NFT';
        asset = 'LiveHypeNFT';
        amount = '1';
        details = 'Mint dynamic Hype NFT for locked outcome';
      } else {
        // Parse amount if present
        amount = text.match(/\d+(\.\d+)?/)?.[0] || '0.1';
        if (text.includes('france')) details = 'France Win';
        else if (text.includes('germany')) details = 'Germany Win';
        else if (text.includes('draw')) details = 'Draw Outcome';
      }

      setCompiledPayload({
        engine: 'Onchain OS NLP compiler v1.2',
        xlayerChainId: 195,
        payload: {
          action: actionType,
          asset: asset,
          value: amount,
          intentDetails: details,
          gasVoucher: 'x402-zero-gas-active',
          timestamp: Date.now()
        }
      });
      setIsCompiling(false);
      toast.success('NLP Instruction Compiled into Onchain OS Action! 🧠');
    }, 1000);
  };

  // Deploy Uniswap v4 Hook handler
  const handleDeployHook = (e) => {
    e.preventDefault();
    setIsHookDeploying(true);
    toast.loading('Compiling FanLiquidityHook.sol & registering afterSwap/liquidity callbacks on X Layer...');

    setTimeout(() => {
      toast.dismiss();
      const mockAddr = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('').slice(0, 8) + '...' + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      let computedFee = '0.30% (Standard Fee)';
      if (Number(volatilityIndex) > 700) {
        computedFee = '0.50% (Volatile Surge Override)';
      } else if (Number(upsetRiskCoeff) < 300) {
        computedFee = '0.15% (High Certainty Discount)';
      }

      const newHook = {
        id: Date.now(),
        roomId: hookRoomId,
        address: mockAddr,
        volatility: volatilityIndex,
        risk: upsetRiskCoeff,
        fee: computedFee,
        gated: varGatedSwap ? 'TRUE' : 'FALSE',
        socialMultiplier: `${(Number(socialMultiplier) / 10000).toFixed(2)}x`,
        fanCredits: '0',
        txHash: mockTx
      };

      setDeployedHooks(prev => [newHook, ...prev]);
      setIsHookDeploying(false);
      toast.success('FanLiquidityHook deployed with social multipliers to X Layer Testnet! 🦄');
    }, 2200);
  };

  // Toggle Skill handler
  const handleToggleSkill = (index) => {
    setSkills(prev => prev.map((skill, i) => i === index ? { ...skill, active: !skill.active } : skill));
    toast.success('Agent plug-and-play Skill updated!');
  };

  return (
    <main className="page-content">
      {/* Hero Header */}
      <section className="section-dark" style={{ paddingBottom: 40 }}>
        <div className="section-inner">
          <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--text-dimmer)', marginBottom: 16 }}>
            X LAYER // EXCHANGE OS // ONCHAIN OS INTEGRATION WORKSPACE
          </p>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(34px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.04em', maxWidth: 900 }}>
            OS Operations Control Room
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', lineHeight: 1.8, maxWidth: '78ch', marginTop: 18 }}>
            Deploy permissionless prediction outcome markets with institutional-grade matching via <strong>Exchange OS</strong>. 
            Configure autonomous agents and plug-and-play Skills via <strong>Onchain OS</strong>.
            Orchestrate AI-powered liquidity fee systems using custom <strong>Uniswap v4 Hooks</strong>.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://web3.okx.com/xlayer" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.68rem' }}>
              X LAYER DOCS
            </a>
            <a href="https://web3.okx.com/onchainos" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.68rem' }}>
              ONCHAIN OS PORTAL
            </a>
          </div>
        </div>
      </section>

      {/* Main Orchestrator Grid */}
      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 32 }} className="agent-ops-grid">
            
            {/* Left Column: Interactive Tab Configurator */}
            <div>
              {/* Tab headers */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: 28, gap: 24, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('exchange-os')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: activeTab === 'exchange-os' ? 'var(--fg)' : 'var(--text-dimmer)',
                    fontFamily: 'var(--font)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    paddingBottom: 12,
                    borderBottom: activeTab === 'exchange-os' ? '2px solid var(--fg)' : '2px solid transparent',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  [1] Exchange OS Markets
                </button>
                <button
                  onClick={() => setActiveTab('onchain-os')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: activeTab === 'onchain-os' ? 'var(--fg)' : 'var(--text-dimmer)',
                    fontFamily: 'var(--font)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    paddingBottom: 12,
                    borderBottom: activeTab === 'onchain-os' ? '2px solid var(--fg)' : '2px solid transparent',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  [2] Onchain OS Skills
                </button>
                <button
                  onClick={() => setActiveTab('uniswap-v4')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: activeTab === 'uniswap-v4' ? 'var(--fg)' : 'var(--text-dimmer)',
                    fontFamily: 'var(--font)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    paddingBottom: 12,
                    borderBottom: activeTab === 'uniswap-v4' ? '2px solid var(--fg)' : '2px solid transparent',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  [3] Uniswap v4 Hooks
                </button>
              </div>

              {/* Tab 1 content: Exchange OS prediction markets configurator */}
              {activeTab === 'exchange-os' && (
                <form onSubmit={handleDeployVenue} className="glass-strong" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.98rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Core Market Venue Configurator
                    </h3>
                    <span className="badge-demo" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--green)' }}>
                      EVM CORE READY
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">VENUES / MARKET NAME</label>
                    <input
                      type="text"
                      className="form-input"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. MatchStake World Cup Arena"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WORLD CUP OUTCOME ASSETS</label>
                    <input
                      type="text"
                      className="form-input"
                      value={outcomeAsset}
                      onChange={(e) => setOutcomeAsset(e.target.value)}
                      placeholder="e.g. Germany vs France — Goals Over/Under"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="viral-task-grid">
                    <div className="form-group">
                      <label className="form-label">MATCHING ORACLE FEED</label>
                      <select className="form-select form-input" value={oracleProvider} onChange={(e) => setOracleProvider(e.target.value)}>
                        <option value="Chainlink / OKLink API Multi-Sig">Chainlink / OKLink API Multi-Sig</option>
                        <option value="SupraOracles Aggregated Sports Feed">SupraOracles Aggregated Sports Feed</option>
                        <option value="Custom MatchStake Admin Multi-Sig">Custom MatchStake Admin Multi-Sig</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">MATCHING PROTOCOL ENGINE</label>
                      <select className="form-select form-input" value={matchingMode} onChange={(e) => setMatchingMode(e.target.value)}>
                        <option value="Limit Order Book (Institutional Matching)">Limit Order Book (Institutional)</option>
                        <option value="Constant Product AMM (Social Pool)">Constant Product AMM (AMM Pool)</option>
                        <option value="Hybrid Outcome Order book">Hybrid Outcome Order book</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">VENUE ADMIN REVENUE FEE SHARE (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="5"
                      className="form-input"
                      value={feePercentage}
                      onChange={(e) => setFeePercentage(e.target.value)}
                    />
                  </div>

                  <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', fontSize: '0.68rem', fontFamily: 'var(--font)', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 24 }}>
                    📌 <strong>EXCHANGE OS SPEC:</strong> Outcomes will resolve into outcome tokens automatically settled via smart contract hooks. 
                    No custom ledger needed; leverages institutional matching core.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={isDeploying}
                  >
                    {isDeploying ? 'DEPLOYING CORE VENUE...' : 'DEPLOY OUTCOME VENUE TO X LAYER'}
                  </button>
                </form>
              )}

              {/* Tab 2 content: Onchain OS Skills & NLP Compiler */}
              {activeTab === 'onchain-os' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Skills lists */}
                  <div className="glass-strong" style={{ padding: 32 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.98rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>
                      Onchain OS plug-and-play Skills
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {skills.map((skill, index) => (
                        <div key={skill.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', fontWeight: 600, color: skill.active ? '#fff' : 'var(--text-dimmer)' }}>
                              {skill.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font)', fontSize: '0.64rem', color: 'var(--text-dim)', marginTop: 4 }}>
                              {skill.description}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleSkill(index)}
                            className="btn"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.58rem',
                              borderColor: skill.active ? 'var(--green)' : 'rgba(255,255,255,0.2)',
                              color: skill.active ? 'var(--green)' : 'var(--text-dimmer)',
                              background: skill.active ? 'rgba(34,197,94,0.06)' : 'transparent'
                            }}
                          >
                            {skill.active ? 'ACTIVE' : 'DISABLED'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NLP Natural Language Staking Terminal */}
                  <form onSubmit={handleCompileCommand} className="glass-strong" style={{ padding: 32 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.98rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>
                      Natural Language Trade Engine
                    </h3>
                    <div className="form-group">
                      <label className="form-label">STAKE INTENT MESSAGE (NATURAL LANGUAGE)</label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          className="form-input"
                          value={naturalLanguageInput}
                          onChange={(e) => setNaturalLanguageInput(e.target.value)}
                          placeholder="e.g. Bet 0.5 OKB on France to win"
                        />
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{ borderRadius: 0, padding: '0 24px' }}
                          disabled={isCompiling}
                        >
                          {isCompiling ? 'COMPILING...' : 'COMPILE'}
                        </button>
                      </div>
                    </div>

                    {compiledPayload && (
                      <div style={{ marginTop: 20 }}>
                        <label className="form-label">ONCHAIN OS CONTEXT PARSING PAYLOAD</label>
                        <pre style={{
                          background: 'rgba(0,0,0,0.85)',
                          border: '1px solid var(--border-light)',
                          padding: 16,
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font)',
                          color: 'var(--green)',
                          overflowX: 'auto',
                          maxHeight: 180,
                          lineHeight: 1.6
                        }}>
                          {JSON.stringify(compiledPayload, null, 2)}
                        </pre>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                          onClick={() => {
                            toast.success('NLP Staking Action Executed successfully via Onchain OS Agentic Wallet! 🤖');
                            setCompiledPayload(null);
                          }}
                        >
                          EXECUTE VIA ONCHAIN OS AGENTIC WALLET
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Tab 3 content: Uniswap v4 Prediction Hooks */}
              {activeTab === 'uniswap-v4' && (
                <form onSubmit={handleDeployHook} className="glass-strong" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.98rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Uniswap v4 Prediction Hook Deployer
                    </h3>
                    <span className="badge-demo" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)' }}>
                      v4 CORE HOOKS
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">STAKING POOL ROOM ID LINK</label>
                    <input
                      type="number"
                      className="form-input"
                      value={hookRoomId}
                      onChange={(e) => setHookRoomId(e.target.value)}
                      placeholder="e.g. 1"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="viral-task-grid">
                    <div className="form-group">
                      <label className="form-label">MATCH VOLATILITY INDEX (1-1000)</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        className="form-input"
                        value={volatilityIndex}
                        onChange={(e) => setVolatilityIndex(e.target.value)}
                        placeholder="760"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">AI UPSET RISK COEFFICIENT (1-1000)</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        className="form-input"
                        value={upsetRiskCoeff}
                        onChange={(e) => setUpsetRiskCoeff(e.target.value)}
                        placeholder="210"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">SOCIAL MULTIPLIER BPS (10000 = 1x, 12500 = 1.25x)</label>
                    <input
                      type="number"
                      min="10000"
                      max="30000"
                      step="500"
                      className="form-input"
                      value={socialMultiplier}
                      onChange={(e) => setSocialMultiplier(e.target.value)}
                      placeholder="12500"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font)', fontSize: '0.78rem', fontWeight: 600 }}>VAR REVIEW / SWAP GATING</span>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', marginTop: 4 }}>
                          Temporarily lock pool swaps during key match incidents (penalties, VAR).
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVarGatedSwap(!varGatedSwap);
                          toast.success(varGatedSwap ? 'VAR Swap Gating disabled!' : 'VAR Swap Gating enabled!');
                        }}
                        className="btn"
                        style={{
                          padding: '5px 12px',
                          fontSize: '0.58rem',
                          borderColor: varGatedSwap ? 'var(--red)' : 'rgba(255,255,255,0.2)',
                          color: varGatedSwap ? 'var(--red)' : 'var(--text-dimmer)',
                          background: varGatedSwap ? 'rgba(239,68,68,0.06)' : 'transparent'
                        }}
                      >
                        {varGatedSwap ? 'GATED' : 'OPEN'}
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', fontSize: '0.68rem', fontFamily: 'var(--font)', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 24 }}>
                    🦄 <strong>UNISWAP V4 HOOK SPEC:</strong> Compiles <code>FanLiquidityHook.sol</code> and registers
                    afterSwap/beforeAddLiquidity callbacks. AI signals adjust dynamic fees via <code>updateMatchSignal()</code>,
                    swap volume generates fan credits per room, prediction liquidity routes into HOME/AWAY/DRAW buckets
                    with social multipliers, and hook events sync dynamic NFT state via <code>syncPredictionNFT()</code>.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={isHookDeploying}
                  >
                    {isHookDeploying ? 'REGISTERING HOOK CALLBACKS...' : 'DEPLOY FAN LIQUIDITY HOOK TO X LAYER'}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Deployed Ledger & Live Agent Telemetry */}
            <div>
              {/* Telemetry panel */}
              <div className="glass-strong" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font)', letterSpacing: '0.12em', color: 'var(--text-dimmer)' }}>
                    ONCHAIN OS AGENT TELEMETRY
                  </span>
                  <span style={{ color: 'var(--green)', fontSize: '0.62rem', animation: 'pulse 1.8s infinite' }}>● ACTIVE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>Agent Wallet:</span>
                    <strong style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--fg)' }}>0x7b5F...A39a</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>OKB Balance:</span>
                    <strong style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--green)' }}>245.50 OKB</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>x402 gas-free vouchers:</span>
                    <strong style={{ fontFamily: 'var(--font)', fontSize: '0.72rem', color: 'var(--gold)' }}>18 Valid</strong>
                  </div>
                </div>
              </div>

              {/* Uniswap v4 Hook Ledger (Rendered when Hook tab or overall ledger exists) */}
              {activeTab === 'uniswap-v4' ? (
                <div className="glass-strong" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
                    Uniswap v4 Registered Hooks
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {deployedHooks.map((hook) => (
                      <div key={hook.id} style={{ padding: 16, border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontFamily: 'var(--font)', fontSize: '0.74rem' }}>Room #{hook.roomId} Pool Hook</strong>
                          <span className="badge-demo" style={{ fontSize: '0.55rem', background: 'rgba(245, 158, 11, 0.08)', color: 'var(--gold)' }}>
                            REGISTERED
                          </span>
                        </div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', marginTop: 8 }}>
                          Dynamic Fee: {hook.fee}
                        </div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', marginTop: 4 }}>
                          Social Multiplier: {hook.socialMultiplier || '1.25x'} · Fan Credits: {hook.fanCredits || '0'}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div>Gated Swap: <strong style={{ color: hook.gated === 'TRUE' ? 'var(--red)' : 'var(--green)' }}>{hook.gated}</strong></div>
                          <div>Hook Address: <code>{hook.address}</code></div>
                          <div>Tx: <a href="https://www.oklink.com/xlayer-test" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--green)' }}>{hook.txHash}</a></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-strong" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
                    Exchange OS Deployed Venues
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {deployedVenues.map((venue) => (
                      <div key={venue.id} style={{ padding: 16, border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontFamily: 'var(--font)', fontSize: '0.74rem' }}>{venue.name}</strong>
                          <span className="badge-demo" style={{ fontSize: '0.55rem', background: 'rgba(34,197,94,0.08)', color: 'var(--green)' }}>
                            {venue.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', marginTop: 8 }}>
                          Asset: {venue.asset}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-dimmer)', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div>Contract: <code>{venue.address}</code></div>
                          <div>Tx: <a href="https://www.oklink.com/xlayer-test" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--green)' }}>{venue.txHash}</a></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Safety Gated Telemetry pipeline */}
      <section className="section-dark" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="glass-strong" style={{ padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.98rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>
              Live Autonomous Pipeline
            </h3>
            <AgentActionConsole matchLabel="Argentina vs France" />
          </div>
        </div>
      </section>
    </main>
  );
}
