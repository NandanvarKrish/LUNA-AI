export type PersonaType = 'luna' | 'architect' | 'creative' | 'thinker' | 'zen';

export interface PersonaInfo {
  id: PersonaType;
  name: string;
  tagline: string;
  description: string;
  avatarIcon: string;
  accentColor: string;
  badgeBg: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  persona?: PersonaType;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  persona: PersonaType;
  messages: ChatMessage[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tag: 'note' | 'task' | 'snippet' | 'idea';
  createdAt: number;
  completed?: boolean;
}

export interface UserSettings {
  persona: PersonaType;
  temperature: number;
  enableSearch: boolean;
  autoSpeak: boolean;
  speechRate: number;
  speechPitch: number;
  selectedVoice: string;
  soundEffects: boolean;
}
