import React, { useState } from 'react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { AgentStatus } from '../types';
import { IconMic, IconStop, IconUser, IconAlex } from './IconComponents';

interface LiveAgentPluginProps {
  onStartLiveAgent: () => void;
  company?: string;
  jobRole?: string;
  customQuestions?: string;
}

export const LiveAgentPlugin: React.FC<LiveAgentPluginProps> = ({ 
  onStartLiveAgent, 
  company, 
  jobRole, 
  customQuestions 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    startSession,
    endSession,
    agentStatus,
    transcripts,
  } = useLiveAgent({ company, jobRole, customQuestions });

  const isConnected = agentStatus !== AgentStatus.DISCONNECTED && agentStatus !== AgentStatus.ERROR;

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      onStartLiveAgent();
    } else {
      setIsExpanded(false);
    }
  };

  const handleStartSession = () => {
    startSession();
  };

  const handleEndSession = () => {
    endSession();
    setIsExpanded(false);
  };

  const getStatusColor = () => {
    switch (agentStatus) {
      case AgentStatus.CONNECTING:
        return 'bg-yellow-500';
      case AgentStatus.LISTENING:
        return 'bg-green-500';
      case AgentStatus.THINKING:
        return 'bg-blue-500';
      case AgentStatus.SPEAKING:
        return 'bg-purple-500';
      case AgentStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (agentStatus) {
      case AgentStatus.CONNECTING:
        return 'Connecting...';
      case AgentStatus.LISTENING:
        return 'Listening';
      case AgentStatus.THINKING:
        return 'Thinking';
      case AgentStatus.SPEAKING:
        return 'Speaking';
      case AgentStatus.ERROR:
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <>
      {/* Floating Plugin Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggle}
          className="w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200"
        >
          {isExpanded ? (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative w-10 h-10">
              {/* Blue hand icon - right hand with fingers slightly curled */}
              <svg className="absolute inset-0 w-10 h-10" viewBox="0 0 24 24" fill="#3B82F6">
                <path d="M18 8h-1V6c0-1.1-.9-2-2-2s-2 .9-2 2v2h-1V4c0-1.1-.9-2-2-2s-2 .9-2 2v4H7V6c0-1.1-.9-2-2-2S3 4.9 3 6v10c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6v-6c0-1.1-.9-2-2-2zm0 8c0 2.2-1.8 4-4 4H9c-2.2 0-4-1.8-4-4V6c0-.6.4-1 1-1s1 .4 1 1v6h2V4c0-.6.4-1 1-1s1 .4 1 1v6h2V6c0-.6.4-1 1-1s1 .4 1 1v6h2c.6 0 1 .4 1 1v3z"/>
              </svg>
              {/* Red circle with white V - positioned at bottom-left of hand */}
              <div className="absolute bottom-1 left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">V</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <div>
                <h3 className="font-semibold text-gray-900">Alex</h3>
                <p className="text-xs text-gray-600">{getStatusText()}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcripts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconAlex className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm">Welcome! Click "Start" to begin chatting with Alex.</p>
              </div>
            ) : (
              transcripts.map((entry, index) => (
                <div key={index} className={`flex items-start gap-2 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {entry.speaker === 'agent' && <IconAlex className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />}
                  <div className={`max-w-xs p-3 rounded-2xl text-sm ${
                    entry.speaker === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p>{entry.text}</p>
                  </div>
                  {entry.speaker === 'user' && <IconUser className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />}
                </div>
              ))
            )}
          </div>

          {/* Control Panel */}
          <div className="p-4 border-t bg-gray-50 rounded-b-xl">
            {!isConnected ? (
              <button
                onClick={handleStartSession}
                disabled={agentStatus === AgentStatus.CONNECTING}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <IconMic className="w-4 h-4" />
                {agentStatus === AgentStatus.CONNECTING ? 'Connecting...' : 'Start Chat'}
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <IconStop className="w-4 h-4" />
                End Chat
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
