import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  BookOpen,
  Settings,
  Trash2,
  Search,
  CheckCircle2,
  Layers,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { ChatSession, PersonaType } from '../types';
import { PERSONAS } from '../utils/constants';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  activeTab: 'chat' | 'analysis' | 'notes' | 'settings';
  currentPersona: PersonaType;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onSelectTab: (tab: 'chat' | 'analysis' | 'notes' | 'settings') => void;
  onSelectPersona: (persona: PersonaType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  activeTab,
  currentPersona,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onSelectTab,
  onSelectPersona,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 flex flex-col luna-glass border-r border-slate-800/80 bg-[#070b14]/95 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App Branding */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
              <span className="text-white font-extrabold text-sm tracking-wider">🌙</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-sky-100 to-cyan-300 bg-clip-text text-transparent">
                  LUNA-AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold">
                  3.8 FLASH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Celestial Companion</p>
            </div>
          </div>
        </div>

        {/* Action Button: New Session */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewSession();
              onSelectTab('chat');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-medium text-sm shadow-md shadow-sky-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="px-3 py-1 space-y-1">
          <button
            onClick={() => {
              onSelectTab('chat');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-sky-300 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Intelligence Chat</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => {
              onSelectTab('analysis');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'bg-slate-800 text-purple-300 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Deep Analysis Studio</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => {
              onSelectTab('notes');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-slate-800 text-emerald-300 font-semibold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Scratchpad & Notes</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Quick Persona Selector */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Luna Persona
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.values(PERSONAS).map((p) => {
              const isSelected = currentPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] text-left transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'border-sky-500/50 bg-sky-950/40 text-sky-200 font-semibold'
                      : 'border-slate-800/60 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{p.name.replace(' Luna', '')}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Sessions List */}
        <div className="flex-1 flex flex-col min-h-0 px-3 pt-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              History ({sessions.length})
            </span>
          </div>

          {/* Search box if there are multiple sessions */}
          {sessions.length > 2 && (
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-300 placeholder-slate-400 focus:outline-none focus:border-slate-600"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredSessions.map((s) => {
              const isCurrent = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    onSelectTab('chat');
                    onCloseMobile();
                  }}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all border ${
                    isCurrent && activeTab === 'chat'
                      ? 'bg-slate-800/90 text-white font-medium border-slate-700/80 shadow-sm'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate flex-1 min-w-0 mr-1">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    <span className="truncate">{s.title || 'Conversation'}</span>
                  </div>

                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => onDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-400 rounded transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & Settings link */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => {
              onSelectTab('settings');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Voice</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Online</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
