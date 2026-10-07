import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, FileText, CheckCircle2, ShieldCheck, Code2, ArrowRight } from 'lucide-react';

export const DeepAnalysisStudio: React.FC = () => {
  const [content, setContent] = useState('');
  const [task, setTask] = useState<'deep-analysis' | 'code-review' | 'action-items' | 'summarize'>('deep-analysis');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysisOptions = [
    {
      id: 'deep-analysis',
      title: 'Multidimensional Analysis',
      desc: 'Summary, key insights, edge cases & next steps',
      icon: Sparkles,
      color: 'text-purple-400',
    },
    {
      id: 'code-review',
      title: 'Architectural Code Review',
      desc: 'Security, performance, clean patterns & refactoring',
      icon: Code2,
      color: 'text-emerald-400',
    },
    {
      id: 'action-items',
      title: 'Action Item Extraction',
      desc: 'Prioritized tasks, deliverables & roadmap',
      icon: CheckCircle2,
      color: 'text-cyan-400',
    },
    {
      id: 'summarize',
      title: 'Executive Briefing',
      desc: 'Crisp high-level summary and critical takeaways',
      icon: FileText,
      color: 'text-amber-400',
    },
  ];

  const handleRunAnalysis = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setResult('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, task }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Analysis failed. Please check server logs.');
      }

      const data = await response.json();
      setResult(data.result || 'No response returned.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-purple-400 mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">LUNA STUDIO</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Deep Analysis & Synthesis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Deploy Gemini 3.8 Flash to dismantle complex problems, review architectures, or synthesize unstructured thoughts.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {analysisOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = task === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTask(opt.id as typeof task)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'border-purple-500/60 bg-purple-950/30 shadow-lg shadow-purple-900/20'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${opt.color}`} />
              <div className="font-semibold text-xs text-white">{opt.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Input area */}
      <div className="luna-glass rounded-2xl p-4 md:p-5 border border-slate-800 mb-6">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Source Material or Prompt
        </label>
        <textarea
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste code, strategy document, architectural question, or research notes here..."
          className="w-full bg-[#080d1a] border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/50 resize-y font-mono"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <span className="text-xs text-slate-400">
            {content.length > 0 ? `${content.length} characters` : 'Tip: You can paste full code files or meeting transcripts'}
          </span>
          <button
            onClick={handleRunAnalysis}
            disabled={loading || !content.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Illuminating Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Deep Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="luna-glass rounded-2xl p-5 md:p-6 border border-slate-800 shadow-xl relative animate-fade-in mb-8">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Synthesized Insights
              </h3>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-[15px] whitespace-pre-wrap leading-relaxed font-sans">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
