import React from 'react';
import { LiveAgentPlugin } from './components/LiveAgentPlugin';

const App: React.FC = () => {
  const handleStartLiveAgent = () => {
    // This function is called when the plugin is clicked
    // The actual live agent functionality is handled within the LiveAgentPlugin component
    console.log('Live agent plugin activated');
  };

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <LiveAgentPlugin onStartLiveAgent={handleStartLiveAgent} />
    </div>
  );
};

export default App;
