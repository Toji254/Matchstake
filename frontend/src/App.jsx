import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import toast from 'react-hot-toast';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Room from './pages/Room';
import CreateRoom from './pages/CreateRoom';
import Leaderboard from './pages/Leaderboard';
import FacilityDetail from './pages/FacilityDetail';
import Swap from './pages/Swap';
import Collection from './pages/Collection';
import Squads from './pages/Squads';
import AgentOps from './pages/AgentOps';
import ShareRoom from './pages/ShareRoom';
import Submission from './pages/Submission';
import Playground from './pages/Playground';
import MatchRooms from './pages/MatchRooms';

import ErrorBoundary from './components/ErrorBoundary';
import DemoTour from './components/DemoTour';
import NetworkGuard from './components/NetworkGuard';
import TransactionLedgerPanel from './components/TransactionLedgerPanel';

function AppNav() {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const defaultConnector = connectors?.[0];

  const handleConnect = () => {
    if (!defaultConnector) {
      toast.error('No wallet connector available. Please refresh and try again.');
      return;
    }
    connect({ connector: defaultConnector });
  };

  // Don't render nav on home page (Hero has its own nav)
  if (location.pathname === '/') return null;
  // Don't render nav on facility detail pages (they have their own nav)
  if (location.pathname.startsWith('/facility/')) return null;

  const navLinks = [
    { label: 'MATCHES', path: '/matches' },
    { label: 'AGENT OPS', path: '/agent-ops' },
    { label: 'LEADERBOARD', path: '/leaderboard' },
    { label: 'SQUADS', path: '/squads' },
    { label: 'MY TICKETS', path: '/collection' },
    { label: 'SWAP', path: '/swap' },
    { label: 'SUBMISSION', path: '/submission' },
    { label: 'PLAYGROUND', path: '/playground' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        MATCHSTAKE
      </Link>
      <ul className="navbar-links">
        {navLinks.map((item, index) => (
          <React.Fragment key={item.path}>
            <li>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
            {index < navLinks.length - 1 && (
              <li><span className="navbar-sep">·</span></li>
            )}
          </React.Fragment>
        ))}
        <li>
          {isConnected ? (
            <button className="wallet-btn wallet-connected" onClick={() => disconnect()}>
              ● {shortAddr}
            </button>
          ) : (
            <button className="wallet-btn" onClick={handleConnect}>
              Connect Wallet
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <>
      <AppNav />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/agent-ops" element={<AgentOps />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/create-room/:matchId" element={<CreateRoom />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/share/:roomId" element={<ShareRoom />} />
          <Route path="/submission" element={<Submission />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/match/:matchId/rooms" element={<MatchRooms />} />
          <Route path="/facility/:slug" element={<FacilityDetail />} />
        </Routes>
      </ErrorBoundary>
      <DemoTour />
      <NetworkGuard />
      <TransactionLedgerPanel />
    </>
  );
}

export default App;
