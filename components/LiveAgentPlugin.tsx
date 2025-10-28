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
  const {
    startSession,
    endSession,
    agentStatus,
    transcripts,
  } = useLiveAgent({ company, jobRole, customQuestions });

  const isConnected = agentStatus !== AgentStatus.DISCONNECTED && agentStatus !== AgentStatus.ERROR;

  const handleStartSession = () => {
    onStartLiveAgent();
    startSession();
  };

  const handleEndSession = () => {
    endSession();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Alex - AI Recruiter</h1>
                  <p className="text-sm text-gray-600">{getStatusText()}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              {company && <p className="text-sm font-semibold text-gray-900">{company}</p>}
              {jobRole && <p className="text-xs text-gray-600">{jobRole}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-6">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          {transcripts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconAlex className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Your Interview</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Alex is ready to chat with you about the {jobRole || 'position'} role{company ? ` at ${company}` : ''}.
                  Click "Start Interview" below to begin.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {transcripts.map((entry, index) => (
                <div key={index} className={`flex items-start gap-4 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {entry.speaker === 'agent' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <IconAlex className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                  <div className={`max-w-2xl p-4 rounded-2xl ${
                    entry.speaker === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-base leading-relaxed">{entry.text}</p>
                  </div>
                  {entry.speaker === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <IconUser className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {!isConnected ? (
            <button
              onClick={handleStartSession}
              disabled={agentStatus === AgentStatus.CONNECTING}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <IconMic className="w-6 h-6" />
              {agentStatus === AgentStatus.CONNECTING ? 'Connecting...' : 'Start Interview'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800">
                  <strong>Interview in progress.</strong> Speak naturally - Alex is listening and will respond.
                </p>
              </div>
              <button
                onClick={handleEndSession}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <IconStop className="w-6 h-6" />
                End Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
