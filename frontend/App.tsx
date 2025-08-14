import React, { useState } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import Manufacturer from './components/Manufacturer';
import Verifier from './components/Verifier';
import './App.css'; // Import the component-specific CSS

function App() {
  const [view, setView] = useState('verifier'); 

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AuthentiChain</h1>
        <WalletSelector />
      </header>
      <nav className="app-nav">
        <button onClick={() => setView('manufacturer')}>Manufacturer View</button>
        <button onClick={() => setView('verifier')}>Buyer/Verifier View</button>
      </nav>
      <main>
        {view === 'manufacturer' ? <Manufacturer /> : <Verifier />}
      </main>
    </div>
  );
}

export default App;