import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Command,
  X,
  Send,
  Copy,
  Check,
  Zap,
  Mail,
  FileText,
  CheckSquare,
  Search,
  Presentation,
  ArrowRight,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface QuickAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const QuickAssistModal: React.FC<QuickAssistModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<'rewrite' | 'shorten' | 'formalize' | 'action_items'>('rewrite');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResponse(null);
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/quick-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: query,
          context: 'Command palette fast workplace copilot',
        }),
      });

      const data = await res.json();
      if (data.result) {
        setResponse(data.result);
      }
    } catch (err) {
      setResponse(`Refined: ${query}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="quick-assist-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                Workplace AI Quick Assist
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Ctrl+K / ⌘K
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Quick Jump Shortcuts */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Jump to Workspace:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                onNavigate('email');
                onClose();
              }}
              className="px-2 py-1 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Mail className="w-3 h-3 text-indigo-600" />
              <span>Email</span>
            </button>
            <button
              onClick={() => {
                onNavigate('meeting');
                onClose();
              }}
              className="px-2 py-1 rounded bg-white hover:bg-violet-50 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3 text-violet-600" />
              <span>Meeting</span>
            </button>
            <button
              onClick={() => {
                onNavigate('tasks');
                onClose();
              }}
              className="px-2 py-1 rounded bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <CheckSquare className="w-3 h-3 text-amber-600" />
              <span>Planner</span>
            </button>
            <button
              onClick={() => {
                onNavigate('research');
                onClose();
              }}
              className="px-2 py-1 rounded bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3 h-3 text-emerald-600" />
              <span>Research</span>
            </button>
            <button
              onClick={() => {
                onNavigate('slides');
                onClose();
              }}
              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Presentation className="w-3 h-3 text-indigo-600" />
              <span>PowerPoint</span>
            </button>
          </div>
        </div>

        {/* Main Body / Form */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Action Modifiers */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Mode:</span>
            {[
              { id: 'rewrite', label: 'Polish & Elevate' },
              { id: 'shorten', label: 'Make 50% Shorter' },
              { id: 'formalize', label: 'Executive Diplomatic' },
              { id: 'action_items', label: 'Extract Checklist' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAction(m.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                  action === m.id
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              placeholder="Paste raw text, message, or notes to refine instantly..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-sans"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {loading ? (
                  <span className="animate-spin text-xs">●</span>
                ) : (
                  <>
                    <span>Execute Assist</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result Card */}
          {response && (
            <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 text-xs text-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  AI Processed Output
                </span>
                <button
                  onClick={handleCopy}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="leading-relaxed whitespace-pre-wrap text-slate-800">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
