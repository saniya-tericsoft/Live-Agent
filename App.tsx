import React, { useState } from 'react';
import { LiveAgentPlugin } from './components/LiveAgentPlugin';
import { Dashboard } from './components/Dashboard';
import { AgentConfig } from './types';

const App: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(true);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  const handleStartLiveAgent = () => {
    console.log('Live agent plugin activated');
  };

  const handleCreateAgent = (agentData: Omit<AgentConfig, 'id' | 'createdAt'>) => {
    const newAgent: AgentConfig = {
      ...agentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setAgents(prev => [...prev, newAgent]);
    setSelectedAgentId(newAgent.id);
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
    if (selectedAgentId === id) {
      setSelectedAgentId(null);
    }
  };

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
  };

  return (
    <div className="min-h-screen" style={{ background: showDashboard ? undefined : 'transparent' }}>
      {/* Dashboard Toggle Button */}
      {!showDashboard && (
        <button
          onClick={() => setShowDashboard(true)}
          className="fixed top-6 left-6 z-50 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium border border-gray-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Dashboard
        </button>
      )}

      {showDashboard ? (
        <div className="relative">
          {/* Close Dashboard Button */}
          {selectedAgent && (
            <button
              onClick={() => setShowDashboard(false)}
              className="fixed top-6 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Go to Interview
            </button>
          )}
          <Dashboard
            agents={agents}
            onCreateAgent={handleCreateAgent}
            onDeleteAgent={handleDeleteAgent}
            onSelectAgent={handleSelectAgent}
            selectedAgentId={selectedAgentId}
          />
        </div>
      ) : (
        selectedAgent && (
          <LiveAgentPlugin
            onStartLiveAgent={handleStartLiveAgent}
            company={selectedAgent.company}
            jobRole={selectedAgent.jobRole}
            customQuestions={selectedAgent.customQuestions}
          />
        )
      )}

      {/* No Agent Selected Message */}
      {!showDashboard && !selectedAgent && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Agent Selected</h2>
            <p className="text-gray-600 mb-4">Please select an agent from the dashboard to start an interview</p>
            <button
              onClick={() => setShowDashboard(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
