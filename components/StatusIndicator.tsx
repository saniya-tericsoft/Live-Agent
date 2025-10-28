
import React from 'react';
import { AgentStatus } from '../types';
import { IconWifi, IconThinking, IconSound, IconMic, IconError, IconOffline } from './IconComponents';

const StatusContent: React.FC<{ status: AgentStatus }> = ({ status }) => {
  switch (status) {
    case AgentStatus.CONNECTING:
      return (
        <>
          <IconWifi />
          <span>Connecting...</span>
        </>
      );
    case AgentStatus.LISTENING:
      return (
        <>
          <IconMic className="text-green-500" />
          <span>Listening...</span>
        </>
      );
    case AgentStatus.THINKING:
       return (
        <>
          <IconThinking className="animate-spin" />
          <span>Alex is thinking...</span>
        </>
      );
    case AgentStatus.SPEAKING:
      return (
        <>
          <IconSound className="text-blue-500" />
          <span>Alex is speaking...</span>
        </>
      );
    case AgentStatus.ERROR:
      return (
        <>
          <IconError />
          <span className="text-red-500">Connection Error</span>
        </>
      );
    case AgentStatus.DISCONNECTED:
    default:
      return (
        <>
          <IconOffline />
          <span>Ready to connect</span>
        </>
      );
  }
};

export const StatusIndicator: React.FC<{ status: AgentStatus }> = ({ status }) => {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
      <StatusContent status={status} />
    </div>
  );
};
