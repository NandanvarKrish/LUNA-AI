import React from 'react';
import { Settings, Volume2, Globe, Sparkles, Layers, Sliders, ShieldCheck } from 'lucide-react';
import { PersonaType, UserSettings } from '../types';
import { PERSONAS } from '../utils/constants';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  onTestVoice: () => void;
  onClearAllSessions: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  availableVoices,
  onTestVoice,
  onClearAllSessions,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sky-400 mb-1">
          <Settings className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">CONFIG & PREFERENCES</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Luna System Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fine-tune reasoning temperature, vocal attributes, active persona, and search grounding.
        </p>
      </div>

      <div className="space-y-6 pb-12">
        {/* Model Card */}
        <div className="luna-glass rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Underlying Intelligence Engine</h3>
                <p className="text-xs text-slate-400">Powered by Google Gemini SDK</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-500/40">
              gemini-3.8-flash
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-speed, multimodal foundation model capable of real-time streaming, contextual reasoning, and voice interaction.
          </p>
        </div>

        {/* Persona Selection */}
        <div className="luna-glass rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center space-x-2.5 mb-4">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-sm text-white">Active Luna Persona</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(PERSONAS).map((p) => {
              const isSelected = settings.persona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdateSettings({ persona: p.id })}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-sky-500/80 bg-sky-950/40 shadow-md shadow-sky-900/30'
                      : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm text-white flex items-center justify-between">
                    <span>{p.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-sky-300/80 mt-0.5 font-medium">{p.tagline}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    {p.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature & Search Grounding */}
        <div className="luna-glass rounded-2xl p-5 border border-slate-800 space-y-5">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-sm text-white">Inference Controls</h3>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Creativity Temperature</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0.1 (Deterministic / Precise)</span>
              <span>0.7 (Balanced)</span>
              <span>1.5 (Imaginative)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Google Search Grounding</div>
                <div className="text-[11px] text-slate-400">
                  Allow Luna to query real-time web knowledge for live facts & dates
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSearch}
                onChange={(e) => onUpdateSettings({ enableSearch: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>
        </div>

        {/* Voice & Speech Synthesis */}
        <div className="luna-glass rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-white">Voice & Speech Synthesis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vocal Synthesis Voice
              </label>
              <select
                value={settings.selectedVoice}
                onChange={(e) => onUpdateSettings({ selectedVoice: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Default System Natural Voice</option>
                {availableVoices
                  .filter((v) => v.lang.startsWith('en'))
                  .map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={onTestVoice}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Test Vocal Output</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Auto-speak Responses</div>
              <div className="text-[11px] text-slate-400">
                Automatically read Luna answers out loud as they complete
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* Data & Sessions */}
        <div className="luna-glass rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Reset Local History</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Clear all saved chat sessions and notes from browser storage
            </p>
          </div>
          <button
            onClick={onClearAllSessions}
            className="px-3.5 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs font-medium transition-colors"
          >
            Clear All History
          </button>
        </div>
      </div>
    </div>
  );
};
