import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Menu,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowUp,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatSession, NoteItem, PersonaType, UserSettings } from './types';
import { PERSONAS, DEFAULT_PROMPT_CARDS } from './utils/constants';
import { useSpeech } from './utils/useSpeech';
import { LunaOrb } from './components/LunaOrb';
import { ChatMessage } from './components/ChatMessage';
import { Sidebar } from './components/Sidebar';
import { DeepAnalysisStudio } from './components/DeepAnalysisStudio';
import { NotesView } from './components/NotesView';
import { SettingsView } from './components/SettingsView';

const STORAGE_KEY_SESSIONS = 'luna_ai_sessions_v1';
const STORAGE_KEY_NOTES = 'luna_ai_notes_v1';
const STORAGE_KEY_SETTINGS = 'luna_ai_settings_v1';

export const App: React.FC = () => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'notes' | 'settings'>('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sparks, setSparks] = useState<string[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (_e) {}
    return {
      persona: 'luna',
      temperature: 0.7,
      enableSearch: false,
      autoSpeak: false,
      speechRate: 1.0,
      speechPitch: 1.0,
      selectedVoice: '',
      soundEffects: true,
    };
  });

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved);
    } catch (_e) {}
    return [
      {
        id: 'initial-note-1',
        title: 'Welcome to Luna AI Companion',
        content: 'Luna features multimodal reasoning with Gemini 3.8 Flash, live speech synthesis, deep architectural analysis, and lunar persona modes.',
        tag: 'note',
        createdAt: Date.now(),
        completed: false,
      },
    ];
  });

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_e) {}

    const initialId = 'session-' + Date.now();
    return [
      {
        id: initialId,
        title: 'Initial Communion',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        persona: 'luna',
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `Greetings. I am **LUNA**, your luminous intelligent companion.\n\nI can assist you with:\n- **Deep Problem Analysis & Reasoning**\n- **Software & Systems Architecture**\n- **Creative Ideation & World Building**\n- **Live Voice Interaction & Synthesis**\n\nHow may I illuminate your thoughts today?`,
            timestamp: Date.now(),
            persona: 'luna',
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'session-1');

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Active session helper
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const currentPersona = settings.persona;

  // Speech integration
  const {
    isListening,
    isSpeaking,
    transcript,
    voices,
    toggleListening,
    speak,
    stopSpeaking,
    setTranscript,
  } = useSpeech({
    rate: settings.speechRate,
    pitch: settings.speechPitch,
    voiceName: settings.selectedVoice,
    onTranscript: (liveText) => {
      setInputPrompt(liveText);
    },
  });

  // Calculate Orb status
  const orbStatus = isSpeaking
    ? 'speaking'
    : isListening
    ? 'listening'
    : isGenerating
    ? 'thinking'
    : 'idle';

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (_e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (_e) {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (_e) {}
  }, [settings]);

  // Auto scroll
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isGenerating, activeTab]);

  // Fetch contextual sparks on assistant response
  const fetchSparks = async (context: string) => {
    try {
      const res = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: context.slice(0, 300) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sparks) && data.sparks.length > 0) {
          setSparks(data.sparks);
        }
      }
    } catch (_e) {}
  };

  // Send message handler with SSE Streaming
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isGenerating) return;

    setInputPrompt('');
    setTranscript('');
    stopSpeaking();

    const userMessage: ChatMessageType = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = 'msg-' + (Date.now() + 1);
    const assistantMessage: ChatMessageType = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      persona: settings.persona,
      isStreaming: true,
    };

    // Update session title if first user message
    const isFirstUserMsg = (currentSession.messages || []).filter((m) => m.role === 'user').length === 0;
    const newTitle = isFirstUserMsg
      ? text.length > 28
        ? text.slice(0, 28) + '...'
        : text
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage, assistantMessage],
          };
        }
        return s;
      })
    );

    setIsGenerating(true);

    try {
      const historyToSend = [
        ...currentSession.messages.filter((m) => !m.error),
        userMessage,
      ].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          persona: settings.persona,
          temperature: settings.temperature,
          enableSearch: settings.enableSearch,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable response stream received.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                // Update assistant message with stream
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === activeSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantPlaceholderId
                            ? { ...m, content: accumulated, isStreaming: true }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err) {
              console.error('Error parsing SSE line:', err);
            }
          }
        }
      }

      // Finalize message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, isStreaming: false }
                  : m
              ),
            };
          }
          return s;
        })
      );

      // Auto-speak if enabled
      if (settings.autoSpeak && accumulated) {
        speak(accumulated);
      }

      // Fetch follow up sparks
      fetchSparks(accumulated);
    } catch (error: unknown) {
      console.error('Generation error:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown generation error';

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: `I encountered an unexpected disruption: ${errMsg}.\nPlease try again.`,
                      isStreaming: false,
                      error: true,
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewSession = () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      persona: settings.persona,
      messages: [
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: `Luna initialized in **${PERSONAS[settings.persona].name}** mode. What shall we explore?`,
          timestamp: Date.now(),
          persona: settings.persona,
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveTab('chat');
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;

    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (activeSessionId === id && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleExportSession = () => {
    const markdown = `# ${currentSession.title}\n\n` +
      `Date: ${new Date(currentSession.createdAt).toLocaleString()}\n` +
      `Persona: ${currentSession.persona}\n\n` +
      currentSession.messages
        .map((m) => `### ${m.role === 'user' ? 'User' : 'LUNA'}\n\n${m.content}\n\n---`)
        .join('\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.title.replace(/[^a-zA-Z0-9]/g, '_')}_Luna.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSpeakMessage = (text: string, msgId: string) => {
    if (isSpeaking && speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      speak(text);
      setSpeakingMessageId(msgId);
    }
  };

  const handleAddNote = (newNote: Omit<NoteItem, 'id' | 'createdAt'>) => {
    setNotes((prev) => [
      {
        ...newNote,
        id: 'note-' + Date.now(),
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleCompleteNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const handleClearAllSessions = () => {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    localStorage.removeItem(STORAGE_KEY_NOTES);
    handleNewSession();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#05070c] text-slate-100">
      {/* Dynamic Starfield Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-sky-900/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-purple-900/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-cyan-900/15 blur-[120px]" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        activeTab={activeTab}
        currentPersona={settings.persona}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onSelectTab={setActiveTab}
        onSelectPersona={(p) => setSettings((s) => ({ ...s, persona: p }))}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-hidden">
        {/* Top App Header */}
        <header className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between luna-glass flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 truncate">
              <LunaOrb
                status={orbStatus}
                persona={settings.persona}
                size="sm"
                onClick={toggleListening}
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-white truncate">
                    {activeTab === 'chat'
                      ? currentSession.title
                      : activeTab === 'analysis'
                      ? 'Deep Analysis Studio'
                      : activeTab === 'notes'
                      ? 'Scratchpad Workspace'
                      : 'Preferences'}
                  </h2>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 truncate">
                  <span className="text-sky-400 font-medium">
                    {PERSONAS[settings.persona].name}
                  </span>
                  <span>•</span>
                  <span>{orbStatus}</span>
                  {isListening && <span className="text-cyan-400 font-bold animate-pulse">(Listening...)</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-1.5">
            {activeTab === 'chat' && (
              <>
                <button
                  onClick={handleExportSession}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors text-xs flex items-center space-x-1"
                  title="Export conversation to Markdown"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Export</span>
                </button>
                <button
                  onClick={handleNewSession}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors text-xs flex items-center space-x-1"
                  title="New conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">New</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* View Routing */}
        {activeTab === 'analysis' ? (
          <DeepAnalysisStudio />
        ) : activeTab === 'notes' ? (
          <NotesView
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onToggleComplete={handleToggleCompleteNote}
          />
        ) : activeTab === 'settings' ? (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
            availableVoices={voices}
            onTestVoice={() => speak('Greetings. I am Luna, your celestial companion. Voice synthesis operational.')}
            onClearAllSessions={handleClearAllSessions}
          />
        ) : (
          /* Main Intelligence Chat View */
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Scrollable Messages Container */}
            <div className="flex-1 overflow-y-auto px-2 md:px-6 py-4 space-y-4">
              {/* Lunar Orb Centerpiece if only 1 welcome message */}
              {currentSession.messages.length <= 1 && (
                <div className="flex flex-col items-center justify-center py-6 md:py-10 text-center animate-fade-in">
                  <div className="mb-5">
                    <LunaOrb
                      status={orbStatus}
                      persona={settings.persona}
                      size="lg"
                      onClick={toggleListening}
                    />
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                    Luna Celestial Intelligence
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 max-w-md mt-1 mb-6 leading-relaxed">
                    Voice-enabled, multithreaded AI reasoning powered by Gemini 3.8 Flash.
                    Click the orb or microphone to speak, or select a spark prompt below.
                  </p>

                  {/* Starter Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-2">
                    {DEFAULT_PROMPT_CARDS.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(card.prompt)}
                        className="p-3.5 rounded-xl luna-glass-card hover:border-sky-500/50 hover:bg-slate-800/60 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono text-sky-400 font-semibold uppercase">
                            {card.category}
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                        <h4 className="text-xs font-semibold text-white group-hover:text-cyan-200">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {card.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages List */}
              {currentSession.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSpeak={(text) => handleSpeakMessage(text, msg.id)}
                  isSpeaking={isSpeaking && speakingMessageId === msg.id}
                />
              ))}

              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Contextual Sparks (Quick follow-up questions) */}
            {sparks.length > 0 && !isGenerating && (
              <div className="px-4 py-1.5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center space-x-1 flex-shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span>Sparks:</span>
                </span>
                {sparks.map((spark, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(spark)}
                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-white transition-all shadow-sm"
                  >
                    {spark}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar & Controls */}
            <div className="p-3 md:p-4 border-t border-slate-800/80 bg-[#060810]/90 backdrop-blur-md flex-shrink-0">
              <div className="max-w-4xl mx-auto">
                {/* Voice active live indicator */}
                {isListening && (
                  <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs animate-pulse">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Luna is listening... Speak clearly</span>
                    </div>
                    <button
                      onClick={toggleListening}
                      className="text-xs font-semibold text-cyan-200 hover:underline"
                    >
                      Done
                    </button>
                  </div>
                )}

                <div className="relative flex items-end luna-glass-input rounded-2xl p-1.5 border border-slate-800 focus-within:border-sky-500/60 shadow-lg">
                  {/* Voice Button */}
                  <button
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                      isListening
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 animate-pulse'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isListening ? 'Stop listening' : 'Speak with microphone'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Input TextArea */}
                  <textarea
                    ref={inputRef}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message Luna (${PERSONAS[settings.persona].name})... Press Enter to send`}
                    rows={1}
                    className="flex-1 bg-transparent border-0 px-3 py-2 text-sm md:text-[15px] text-white placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[38px]"
                    style={{ height: 'auto' }}
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim() || isGenerating}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-sky-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    title="Send prompt"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Subtext info */}
                <div className="flex items-center justify-between mt-1.5 px-2 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span>Persona: <strong className="text-slate-300">{PERSONAS[settings.persona].name}</strong></span>
                    {settings.enableSearch && <span className="text-emerald-400 font-semibold">• Web Search Active</span>}
                  </div>
                  <span>Shift + Enter for new line</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
