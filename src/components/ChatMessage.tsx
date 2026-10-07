import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Moon, Sparkles, Cpu, Brain, Compass, AlertCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType, PersonaType } from '../types';
import { PERSONAS } from '../utils/constants';

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  isSpeaking = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const persona: PersonaType = message.persona || 'luna';
  const currentPersona = PERSONAS[persona] || PERSONAS.luna;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPersonaIcon = () => {
    switch (persona) {
      case 'architect':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'creative':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'thinker':
        return <Brain className="w-4 h-4 text-amber-400" />;
      case 'zen':
        return <Compass className="w-4 h-4 text-teal-400" />;
      case 'luna':
      default:
        return <Moon className="w-4 h-4 text-sky-400" />;
    }
  };

  // Helper to render markdown-like formatting (code blocks, bold, headers, lists)
  const renderFormattedContent = (content: string) => {
    // Split by code blocks ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        value: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex),
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <CodeBlock
            key={index}
            language={part.language}
            code={part.value}
          />
        );
      }

      // Process regular text paragraphs, bold, bullet points
      const lines = part.value.split('\n');
      return (
        <div key={index} className="space-y-2 my-1 leading-relaxed text-slate-200">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lIdx} className="h-2" />;
            }

            // Headers
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-base font-semibold text-sky-200 pt-2 pb-1">
                  {formatInlineText(trimmed.replace('### ', ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="text-lg font-bold text-sky-100 pt-3 pb-1 border-b border-slate-800">
                  {formatInlineText(trimmed.replace('## ', ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={lIdx} className="text-xl font-extrabold text-white pt-4 pb-1">
                  {formatInlineText(trimmed.replace('# ', ''))}
                </h2>
              );
            }

            // Unordered list items
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 pl-2">
                  <span className="text-sky-400 mt-1 text-xs">•</span>
                  <span>{formatInlineText(trimmed.substring(2))}</span>
                </div>
              );
            }

            // Ordered list
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 pl-2">
                  <span className="text-sky-400 text-xs font-mono font-bold mt-1">
                    {numMatch[1]}.
                  </span>
                  <span>{formatInlineText(numMatch[2])}</span>
                </div>
              );
            }

            // Blockquote
            if (trimmed.startsWith('> ')) {
              return (
                <div
                  key={lIdx}
                  className="border-l-2 border-sky-500/50 pl-3 py-1 text-slate-400 italic bg-sky-950/20 rounded-r"
                >
                  {formatInlineText(trimmed.replace('> ', ''))}
                </div>
              );
            }

            return <p key={lIdx}>{formatInlineText(line)}</p>;
          })}
        </div>
      );
    });
  };

  // Inline formatting helper (bold, italic, inline code)
  const formatInlineText = (text: string): React.ReactNode => {
    // Regex for inline code `code`
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700/60"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      return token;
    });
  };

  return (
    <div
      className={`flex w-full group py-3 px-2 md:px-4 rounded-xl transition-colors duration-200 ${
        isUser
          ? 'justify-end'
          : 'justify-start hover:bg-white/[0.02]'
      }`}
    >
      <div
        className={`flex max-w-[94%] md:max-w-[85%] space-x-3 ${
          isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-900/40 border border-cyan-400/30">
              U
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-lg ${currentPersona.badgeBg}`}
              title={currentPersona.name}
            >
              {getPersonaIcon()}
            </div>
          )}
        </div>

        {/* Message Bubble & Content */}
        <div className="flex flex-col space-y-1 overflow-hidden min-w-0 flex-1">
          {/* Header info */}
          <div
            className={`flex items-center space-x-2 text-xs text-slate-400 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {!isUser && (
              <span className="font-semibold text-slate-200">
                {currentPersona.name}
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Bubble container */}
          <div
            className={`relative rounded-2xl px-4 py-3 text-sm md:text-[15px] shadow-sm ${
              isUser
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-tr-none'
                : 'luna-glass rounded-tl-none border border-slate-800 text-slate-100'
            } ${message.error ? 'border-red-500/50 bg-red-950/20' : ''}`}
          >
            {message.error && (
              <div className="flex items-center space-x-2 text-red-400 mb-2 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Notice</span>
              </div>
            )}

            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-200">
                {renderFormattedContent(message.content)}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                )}
              </div>
            )}
          </div>

          {/* Action bar for assistant messages */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="flex items-center space-x-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs flex items-center space-x-1"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onSpeak && (
                <button
                  onClick={() => onSpeak(message.content)}
                  className={`p-1 rounded-md transition-colors text-xs flex items-center space-x-1 ${
                    isSpeaking
                      ? 'text-cyan-300 bg-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={isSpeaking ? 'Stop speech' : 'Read aloud with Luna voice'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="text-[11px]">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Speak</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for code blocks
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#070b13] shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider text-[11px] text-cyan-400 font-semibold">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center space-x-1 hover:text-slate-200 transition-colors py-0.5 px-2 rounded hover:bg-slate-800"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono text-cyan-50/90 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
