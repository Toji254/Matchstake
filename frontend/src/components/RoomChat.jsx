import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const INITIAL_MESSAGES = [
  { id: 1, sender: 'alpha_striker', time: '14:02:11', text: 'Lads, Mbappe is absolutely cooking Germany\'s right back already.', isAgent: false },
  { id: 2, sender: 'kenyan_goat', time: '14:02:40', text: 'Yeah, Germany\'s high line is begging to get exploited. Speed is too much.', isAgent: false },
  {
    id: 3,
    sender: 'MATCHSTAKE_CO_PILOT',
    time: '14:03:02',
    text: '🤖 [ONCHAINOS INTEL] Germany defensive line height: 58m (High risk). France counter-attack success rate: +24% today. Tactical recommendation: Predict Draw or France Win.',
    isAgent: true,
    action: { type: 'suggest', home: 2, away: 2, label: 'USE SUGGESTED SCORE: 2 - 2' }
  },
  { id: 4, sender: 'lowkey_dev', time: '14:04:15', text: 'I\'m thinking of staking 0.2 OKB on a high-scoring draw. What does the aggregator look like?', isAgent: false },
  {
    id: 5,
    sender: 'MATCHSTAKE_CO_PILOT',
    time: '14:04:30',
    text: '🤖 [OKX DEX ROUTE] Optimal path located: USDT → OKB (0.019% slippage, X Layer). Zero-gas signature prepared via x402 voucher.',
    isAgent: true,
    action: { type: 'swap', label: 'APPROVE SWAP & STAKE' }
  }
];

const CHAT_SIMULATIONS = [
  { sender: 'kenyan_goat', text: 'Just locked in my stake! Let\'s go!' },
  { sender: 'alpha_striker', text: 'Germany is settling down now, Musiala is starting to drop deep and playmake.' },
  { sender: 'lowkey_dev', text: 'Unbelievable block! That was nearly 1-0 to France.' },
  {
    sender: 'MATCHSTAKE_CO_PILOT',
    text: '🤖 [LIVE HYPE UPDATED] Room hype index surged to 76. Live Hype NFT ticket has morphed with heating glow layer.',
    isAgent: true
  },
  { sender: 'alpha_striker', text: 'Hype NFT reacts live? That is incredibly slick.' }
];

export default function RoomChat({ homeTeam, awayTeam, onSelectPrediction }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [simIndex, setSimIndex] = useState(0);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate incoming chatter from other room members
  useEffect(() => {
    const chatTimer = setInterval(() => {
      if (simIndex >= CHAT_SIMULATIONS.length) return;

      const nextMsg = CHAT_SIMULATIONS[simIndex];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: nextMsg.sender,
          time: timeStr,
          text: nextMsg.text,
          isAgent: nextMsg.isAgent || false,
          action: nextMsg.isAgent ? { type: 'alert', label: 'REFRESH STATE' } : null
        }
      ]);

      setSimIndex((prev) => prev + 1);
    }, 12000);

    return () => clearInterval(chatTimer);
  }, [simIndex]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newMsg = {
      id: Date.now(),
      sender: 'YOU (0xf39F...)',
      time: timeStr,
      text: userText,
      isAgent: false
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    const appendAgentReply = (aiText, aiAction) => {
      const aiTime = new Date().toTimeString().split(' ')[0];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'MATCHSTAKE_CO_PILOT',
          time: aiTime,
          text: `🤖 [GEMINI CO-PILOT] ${aiText}`,
          isAgent: true,
          action: aiAction,
        },
      ]);
      toast.success('AI Co-Pilot responded in chat! 🤖');
    };

    (async () => {
      try {
        const res = await fetch('/api/prediction/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            homeTeam: homeTeam || 'Home',
            awayTeam: awayTeam || 'Away',
            message: userText,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Chat API failed');

        let aiAction = null;
        const textLower = userText.toLowerCase();
        if (
          Number.isFinite(data.suggestedHome) &&
          Number.isFinite(data.suggestedAway)
        ) {
          aiAction = {
            type: 'suggest',
            home: data.suggestedHome,
            away: data.suggestedAway,
            label: `AUTO-FILL ${data.suggestedHome}-${data.suggestedAway}`,
          };
        } else if (textLower.includes('swap') || textLower.includes('dex') || textLower.includes('okb')) {
          aiAction = { type: 'swap', label: 'ROUTE DEX SWAP' };
        }

        appendAgentReply(data.reply, aiAction);
      } catch {
        const textLower = userText.toLowerCase();
        let aiText = 'Watch party synced — ready for predictions and stakes.';
        let aiAction = null;
        if (textLower.includes('predict') || textLower.includes('score')) {
          aiText = 'Tactical read: 2-2 draw is a solid stake candidate for this clash.';
          aiAction = { type: 'suggest', home: 2, away: 2, label: 'AUTO-FILL 2-2 DRAW' };
        } else if (textLower.includes('swap') || textLower.includes('okb')) {
          aiText = 'Route OKB via the Swap page — OKX DEX aggregator on X Layer.';
          aiAction = { type: 'swap', label: 'ROUTE DEX SWAP' };
        }
        appendAgentReply(aiText, aiAction);
      }
    })();
  };

  const handleAction = (action) => {
    if (action.type === 'suggest') {
      if (onSelectPrediction) {
        onSelectPrediction(action.home, action.away);
        toast.success('Suggested score applied to prediction! 🎯');
      }
    } else if (action.type === 'swap') {
      toast.success('DEX Route selected! Navigating to Swap portal...');
      const swapTab = document.querySelector('[href="/swap"]');
      if (swapTab) {
        swapTab.click();
      } else {
        window.open('/swap', '_self');
      }
    }
  };

  return (
    <div className="glass-strong" style={{ display: 'flex', flexDirection: 'column', height: 480, border: '1px solid var(--border-light)', marginBottom: 24 }}>
      {/* Chat header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--green)', fontSize: '0.65rem', animation: 'pulse 1.8s infinite' }}>●</span>
          <span style={{ fontFamily: 'var(--font)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WATCH PARTY LIVE CHAT
          </span>
        </div>
        <span className="badge-demo" style={{ fontSize: '0.55rem' }}>
          6 MEMBERS // AI ACTIVE
        </span>
      </div>

      {/* Chat feed list */}
      <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg) => {
          const isMe = msg.sender.startsWith('YOU');
          const isAgent = msg.isAgent;

          return (
            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <span style={{
                  fontFamily: 'var(--font)',
                  fontSize: '0.58rem',
                  fontWeight: isAgent ? 700 : 500,
                  color: isAgent ? 'var(--gold)' : isMe ? 'var(--green)' : 'var(--text-dim)',
                  letterSpacing: '0.04em'
                }}>
                  {isAgent ? '🤖 MATCHSTAKE_CO_PILOT' : msg.sender}
                </span>
                <span style={{ fontSize: '0.5rem', color: 'var(--text-dimmer)' }}>{msg.time}</span>
              </div>
              <div style={{
                padding: '12px 14px',
                background: isAgent ? 'rgba(245, 158, 11, 0.04)' : isMe ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isAgent ? 'var(--gold)' : isMe ? 'var(--green)' : 'var(--border-light)'}`,
                fontFamily: 'var(--font)',
                fontSize: '0.74rem',
                lineHeight: 1.6,
                color: isAgent ? '#fff' : 'var(--text-dim)',
              }}>
                <div>{msg.text}</div>
                {isAgent && msg.action && (
                  <button
                    onClick={() => handleAction(msg.action)}
                    className="btn"
                    style={{
                      marginTop: 10,
                      padding: '5px 12px',
                      fontSize: '0.58rem',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: 2
                    }}
                  >
                    {msg.action.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input section */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-light)' }}>
        <input
          type="text"
          className="form-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Sync intent with AI Co-Pilot / Chat..."
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '14px 16px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font)',
          }}
        />
        <button
          type="submit"
          className="btn"
          style={{
            border: 'none',
            borderLeft: '1px solid var(--border-light)',
            background: 'rgba(255,255,255,0.01)',
            padding: '0 20px',
            borderRadius: 0,
            fontSize: '0.68rem',
            color: 'var(--fg)',
            letterSpacing: '0.08em'
          }}
        >
          SEND
        </button>
      </form>
    </div>
  );
}
