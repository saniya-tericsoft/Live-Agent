
import React from 'react';
import { IconMic, IconStop } from './IconComponents';

interface ControlPanelProps {
  isConnected: boolean;
  isConnecting: boolean;
  onStart: () => void;
  onEnd: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ isConnected, isConnecting, onStart, onEnd }) => {
  if (!isConnected) {
    return (
      <button
        onClick={onStart}
        disabled={isConnecting}
        className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        <IconMic className="w-5 h-5"/>
        {isConnecting ? 'Connecting...' : 'Start Conversation'}
      </button>
    );
  }

  return (
    <button
      onClick={onEnd}
      className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold shadow-lg hover:bg-red-700 transition-all flex items-center gap-2"
    >
      <IconStop className="w-5 h-5"/>
      End Conversation
    </button>
  );
};
