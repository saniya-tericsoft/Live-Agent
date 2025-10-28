
export enum AgentStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR',
}

export interface TranscriptEntry {
  speaker: 'user' | 'agent';
  text: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  company: string;
  jobRole: string;
  customQuestions: string;
  createdAt: Date;
}
