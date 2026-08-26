import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Sparkles,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  TrendingUp,
  LayoutGrid,
  Columns,
  List,
  Flame,
  Bookmark,
  Share2,
  RefreshCw,
  Sliders,
  Palette,
  Lightbulb,
  Edit3,
} from 'lucide-react';
import { SlideDeckResult, SlideDeckRecord, SlideItem, SlideTheme, SlideLayout } from '../types';
import { exportToPptx } from '../utils/exportPptx';
import { saveSlideDeckRecord } from '../utils/storage';

interface SlideGeneratorViewProps {
  initialDeck?: SlideDeckRecord | null;
  onSaveSlideDeck?: (deck: SlideDeckRecord) => void;
  onSaveToWorkspace?: (deck: SlideDeckRecord) => void;
  savedSlideDecks?: SlideDeckRecord[];
  onClearInitialDeck?: () => void;
  chatContext?: string;
}

const PRESET_TOPICS = [
  {
    title: 'AI Workplace Productivity Assistant',
    desc: 'Executive deck on automated daily tasks, meeting summaries & task planner',
    theme: 'indigo' as SlideTheme,
    count: 5,
  },
  {
    title: 'Sprint 24 Roadmap & Checkout Launch',
    desc: 'Engineering sync presentation with 2-step checkout metrics & QA plan',
    theme: 'slate' as SlideTheme,
    count: 5,
  },
  {
    title: 'Enterprise AI ROI & Time Savings',
    desc: 'Market research synthesis on 4.5 hrs/week reclaimed capacity',
    theme: 'emerald' as SlideTheme,
    count: 5,
  },
  {
    title: 'Executive Weekly Operations Rollup',
    desc: 'Leadership review on P1 Eisenhower deliverables & team bandwidth',
    theme: 'midnight' as SlideTheme,
    count: 4,
  },
];

export const SlideGeneratorView: React.FC<SlideGeneratorViewProps> = ({
  initialDeck,
  onSaveSlideDeck,
  onSaveToWorkspace,
  savedSlideDecks,
  onClearInitialDeck,
  chatContext = '',
}) => {
  // Input state
  const [topic, setTopic] = useState(
    initialDeck ? initialDeck.topic : 'AI Workplace Productivity Assistant: Automated Daily Tasks & Executive Overview'
  );
  const [targetAudience, setTargetAudience] = useState(
    initialDeck ? initialDeck.result.targetAudience : 'Executive Leadership & Board'
  );
  const [slideCount, setSlideCount] = useState<number>(
    initialDeck ? initialDeck.result.totalSlides : 5
  );
  const [theme, setTheme] = useState<SlideTheme>(
    initialDeck ? initialDeck.result.theme : 'indigo'
  );
  const [customInstructions, setCustomInstructions] = useState('');
  const [sourceContext, setSourceContext] = useState(chatContext || '');

  // Output & presenter state
  const [currentDeck, setCurrentDeck] = useState<SlideDeckResult | null>(
    initialDeck ? initialDeck.result : null
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeSlideOverride, setActiveSlideOverride] = useState<SlideItem | null>(null);

  // Initialize with initial deck or fallback deck
  useEffect(() => {
    if (initialDeck) {
      setCurrentDeck(initialDeck.result);
      setTopic(initialDeck.topic);
      setTheme(initialDeck.result.theme);
      setActiveSlideIndex(0);
    } else if (!currentDeck) {
      // Auto-load default executive deck if none active
      handleGenerateSlides(true);
    }
  }, [initialDeck]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentDeck) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (activeSlideIndex < currentDeck.slides.length - 1) {
          setActiveSlideIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeSlideIndex > 0) {
          setActiveSlideIndex(prev => prev - 1);
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDeck, activeSlideIndex, isFullscreen]);

  const handleGenerateSlides = async (isInitial = false) => {
    setIsGenerating(true);
    setIsSaved(false);
    try {
      const response = await fetch('/api/ai/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || 'AI Workplace Productivity Assistant',
          targetAudience,
          slideCount,
          theme,
          sourceContext: sourceContext || chatContext,
          customInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate slides');
      }

      const data: SlideDeckResult = await response.json();
      setCurrentDeck(data);
      setActiveSlideIndex(0);

      // Save to storage automatically
      const newRecord: SlideDeckRecord = {
        id: `slides-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: data.title || topic,
        topic: topic,
        theme: data.theme || theme,
        slideCount: data.slides?.length || slideCount,
        result: data,
      };
      saveSlideDeckRecord(newRecord);
      if (onSaveSlideDeck) {
        onSaveSlideDeck(newRecord);
      }
      if (onSaveToWorkspace) {
        onSaveToWorkspace(newRecord);
      }
      setIsSaved(true);
    } catch (err) {
      console.error('Error generating slides:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPptx = async () => {
    if (!currentDeck) return;
    setIsExporting(true);
    try {
      await exportToPptx(currentDeck, currentDeck.title);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyOutline = () => {
    if (!currentDeck) return;
    const text = currentDeck.slides
      .map((s) => {
        let content = `# Slide ${s.slideNumber}: ${s.title}\n${s.subtitle ? `*${s.subtitle}*\n` : ''}\n`;
        if (s.bullets) content += s.bullets.map(b => `- ${b}`).join('\n') + '\n';
        if (s.cards) content += s.cards.map(c => `- **${c.title}** (${c.tag || 'Item'}): ${c.description}`).join('\n') + '\n';
        if (s.metrics) content += s.metrics.map(m => `- ${m.label}: **${m.value}** (${m.change || ''})`).join('\n') + '\n';
        if (s.leftContent && s.rightContent) {
          content += `\n[Left Column]:\n${s.leftContent.map(l => `- ${l}`).join('\n')}\n[Right Column]:\n${s.rightContent.map(r => `- ${r}`).join('\n')}\n`;
        }
        if (s.takeaway) content += `\n> **Key Takeaway:** ${s.takeaway}\n`;
        if (s.speakerNotes) content += `\n*Speaker Notes:* ${s.speakerNotes}\n`;
        return content;
      })
      .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDeck = () => {
    if (!currentDeck) return;
    const record: SlideDeckRecord = {
      id: `slides-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: currentDeck.title || topic,
      topic: topic,
      theme: currentDeck.theme || theme,
      slideCount: currentDeck.slides.length,
      result: currentDeck,
    };
    saveSlideDeckRecord(record);
    if (onSaveSlideDeck) {
      onSaveSlideDeck(record);
    }
    if (onSaveToWorkspace) {
      onSaveToWorkspace(record);
    }
    setIsSaved(true);
  };

  const currentSlide = currentDeck?.slides[activeSlideIndex] || null;

  // Visual Theme styles
  const getThemeClasses = (t: SlideTheme) => {
    switch (t) {
      case 'indigo':
        return {
          stageBg: 'bg-slate-900',
          slideCanvas: 'bg-white text-slate-900 border-indigo-100',
          accentPill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          primaryText: 'text-slate-900',
          secondaryText: 'text-slate-500',
          cardBg: 'bg-slate-50 border-slate-200/80 hover:border-indigo-300',
          cardTag: 'bg-indigo-100 text-indigo-800',
          highlightBox: 'bg-indigo-50/70 border-indigo-200 text-indigo-950',
          metricVal: 'text-indigo-600',
          divider: 'border-slate-100',
          borderAccent: 'border-l-4 border-indigo-600',
        };
      case 'slate':
        return {
          stageBg: 'bg-slate-950',
          slideCanvas: 'bg-white text-slate-900 border-slate-200',
          accentPill: 'bg-slate-100 text-slate-700 border-slate-300',
          primaryText: 'text-slate-900',
          secondaryText: 'text-slate-500',
          cardBg: 'bg-slate-50 border-slate-200 hover:border-slate-400',
          cardTag: 'bg-slate-200 text-slate-800',
          highlightBox: 'bg-slate-100 border-slate-300 text-slate-900',
          metricVal: 'text-slate-800',
          divider: 'border-slate-200',
          borderAccent: 'border-l-4 border-slate-700',
        };
      case 'emerald':
        return {
          stageBg: 'bg-emerald-950',
          slideCanvas: 'bg-white text-slate-900 border-emerald-100',
          accentPill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          primaryText: 'text-emerald-950',
          secondaryText: 'text-slate-600',
          cardBg: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300',
          cardTag: 'bg-emerald-100 text-emerald-800',
          highlightBox: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          metricVal: 'text-emerald-600',
          divider: 'border-emerald-100',
          borderAccent: 'border-l-4 border-emerald-600',
        };
      case 'midnight':
        return {
          stageBg: 'bg-slate-950',
          slideCanvas: 'bg-slate-900 text-slate-100 border-slate-800',
          accentPill: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
          primaryText: 'text-slate-100',
          secondaryText: 'text-slate-400',
          cardBg: 'bg-slate-800/80 border-slate-700/80 hover:border-indigo-500/50',
          cardTag: 'bg-indigo-900/60 text-indigo-300',
          highlightBox: 'bg-slate-800/90 border-slate-700 text-slate-200',
          metricVal: 'text-indigo-400',
          divider: 'border-slate-800',
          borderAccent: 'border-l-4 border-indigo-500',
        };
      case 'sunset':
        return {
          stageBg: 'bg-stone-900',
          slideCanvas: 'bg-white text-stone-900 border-orange-100',
          accentPill: 'bg-orange-50 text-orange-700 border-orange-200',
          primaryText: 'text-stone-900',
          secondaryText: 'text-stone-500',
          cardBg: 'bg-orange-50/40 border-orange-100 hover:border-orange-300',
          cardTag: 'bg-orange-100 text-orange-800',
          highlightBox: 'bg-orange-50/80 border-orange-200 text-orange-950',
          metricVal: 'text-orange-600',
          divider: 'border-orange-100',
          borderAccent: 'border-l-4 border-orange-600',
        };
    }
  };

  const themeStyle = getThemeClasses(currentDeck?.theme || theme);

  return (
    <div id="slide-generator-workspace" className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-violet-950 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Presentation className="w-3.5 h-3.5 text-indigo-400" />
              PowerPoint Deck Studio
            </span>
            <span className="text-xs text-indigo-300/80 font-medium">
              Export real .pptx slides with one click
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Executive PowerPoint Generator
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Transform chat conversations, meeting notes, research findings, and task plans into
            structured, formatted PowerPoint presentations ready for leadership reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="download-pptx-btn"
            onClick={handleExportPptx}
            disabled={!currentDeck || isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download .PPTX</span>
          </button>
          <button
            id="copy-deck-outline-btn"
            onClick={handleCopyOutline}
            disabled={!currentDeck}
            className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Outline'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Starters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Quick-Generate Slide Decks from Workplace Intelligence
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(preset.title);
                setTheme(preset.theme);
                setSlideCount(preset.count);
              }}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                topic === preset.title
                  ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="font-semibold text-xs text-slate-900 truncate">{preset.title}</div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Controls & Live Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" /> Deck Configuration
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">Gemini 3.7 Flash</span>
            </div>

            {/* Topic / Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Presentation Topic or Chat Information
              </label>
              <textarea
                id="slide-topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI Workplace Productivity Assistant: Automated Daily Tasks & Executive Overview"
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Audience
              </label>
              <select
                id="slide-audience-select"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 cursor-pointer"
              >
                <option value="Executive Leadership & Board">Executive Leadership & Board</option>
                <option value="Client / Stakeholders">Client / External Stakeholders</option>
                <option value="Product & Engineering Team">Product & Engineering Team</option>
                <option value="Company All-Hands">Company All-Hands</option>
                <option value="Cross-functional Partners">Cross-functional Partners</option>
              </select>
            </div>

            {/* Slide Count & Theme Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Slide Count
                </label>
                <select
                  id="slide-count-select"
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 cursor-pointer"
                >
                  <option value={3}>3 Slides (Briefing)</option>
                  <option value={5}>5 Slides (Executive)</option>
                  <option value={7}>7 Slides (Standard)</option>
                  <option value={10}>10 Slides (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Visual Theme
                </label>
                <select
                  id="slide-theme-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as SlideTheme)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 cursor-pointer capitalize"
                >
                  <option value="indigo">Indigo Executive</option>
                  <option value="slate">Minimal Slate</option>
                  <option value="emerald">Emerald Growth</option>
                  <option value="midnight">Midnight Dark</option>
                  <option value="sunset">Warm Sunset</option>
                </select>
              </div>
            </div>

            {/* Optional Source Context / Chat Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Notes or Context (Optional)
              </label>
              <textarea
                id="slide-notes-context"
                value={sourceContext}
                onChange={(e) => setSourceContext(e.target.value)}
                placeholder="Paste meeting notes, research findings, or specific metrics you want included in the slides..."
                rows={2}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Generate Action Button */}
            <button
              id="generate-slides-action-btn"
              onClick={() => handleGenerateSlides(false)}
              disabled={isGenerating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing PowerPoint Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate PowerPoint Slide Deck</span>
                </>
              )}
            </button>
          </div>

          {/* Slide Deck Metadata & Quick Info Card */}
          {currentDeck && (
            <div className="bg-slate-900 rounded-2xl p-4 text-slate-300 text-xs border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <Presentation className="w-3.5 h-3.5 text-indigo-400" /> Deck Stats
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  {currentDeck.slides.length} Slides Ready
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Audience:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[160px]">
                    {currentDeck.targetAudience}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Theme:</span>
                  <span className="text-indigo-300 font-medium capitalize">
                    {currentDeck.theme}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready to present & download
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Stage: Interactive Slide Canvas & Presenter (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentDeck && currentSlide ? (
            <div className="space-y-4">
              {/* Presenter Toolbar */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Slide {activeSlideIndex + 1} of {currentDeck.slides.length}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium uppercase text-[10px]">
                    {currentSlide.layout}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                      showSpeakerNotes
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presenter'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  <button
                    onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                    disabled={activeSlideIndex === 0}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setActiveSlideIndex(
                        Math.min(currentDeck.slides.length - 1, activeSlideIndex + 1)
                      )
                    }
                    disabled={activeSlideIndex === currentDeck.slides.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 16:9 Presentation Canvas Container */}
              <div
                className={`relative rounded-2xl transition-all duration-300 shadow-xl overflow-hidden border border-slate-200/80 ${
                  themeStyle.slideCanvas
                } ${
                  isFullscreen
                    ? 'fixed inset-4 z-50 flex flex-col justify-between p-8 sm:p-12'
                    : 'p-6 sm:p-8 min-h-[440px] flex flex-col justify-between'
                }`}
                style={{ aspectRatio: isFullscreen ? 'auto' : '16/9' }}
              >
                {/* Top Slide Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${themeStyle.accentPill}`}
                    >
                      {currentDeck.title}
                    </span>
                    <span className={`text-xs font-mono font-bold ${themeStyle.secondaryText}`}>
                      {String(activeSlideIndex + 1).padStart(2, '0')} /{' '}
                      {String(currentDeck.slides.length).padStart(2, '0')}
                    </span>
                  </div>

                  <h3
                    className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${themeStyle.primaryText} leading-snug`}
                  >
                    {currentSlide.title}
                  </h3>
                  {currentSlide.subtitle && (
                    <p className={`text-xs sm:text-sm mt-1 font-medium ${themeStyle.secondaryText}`}>
                      {currentSlide.subtitle}
                    </p>
                  )}
                </div>

                {/* Main Slide Body based on Layout */}
                <div className="my-4 flex-1 flex flex-col justify-center">
                  {/* 1. TITLE OPENING SLIDE */}
                  {currentSlide.layout === 'title' && (
                    <div className="py-6 space-y-4">
                      <div className="w-16 h-1 bg-indigo-600 rounded-full" />
                      <p className={`text-sm sm:text-base font-normal ${themeStyle.secondaryText} max-w-xl leading-relaxed`}>
                        A comprehensive intelligence brief prepared for {currentDeck.targetAudience}, focusing on automated daily workflows, operational time-savings, and strategic velocity.
                      </p>
                    </div>
                  )}

                  {/* 2. CARDS / PILLARS LAYOUT */}
                  {currentSlide.layout === 'cards' && currentSlide.cards && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto">
                      {currentSlide.cards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className={`p-3.5 rounded-xl border transition-all ${themeStyle.cardBg}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {card.title}
                            </span>
                            {card.tag && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${themeStyle.cardTag}`}
                              >
                                {card.tag}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${themeStyle.secondaryText}`}>
                            {card.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. METRICS / STATS LAYOUT */}
                  {currentSlide.layout === 'metrics' && currentSlide.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto">
                      {currentSlide.metrics.map((metric, mIdx) => (
                        <div
                          key={mIdx}
                          className={`p-4 rounded-xl border text-center transition-all ${themeStyle.cardBg}`}
                        >
                          <div className={`text-2xl sm:text-3xl font-black tracking-tight ${themeStyle.metricVal}`}>
                            {metric.value}
                          </div>
                          <div className={`text-xs font-bold mt-1.5 ${themeStyle.primaryText}`}>
                            {metric.label}
                          </div>
                          {metric.change && (
                            <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center justify-center gap-0.5">
                              <TrendingUp className="w-3 h-3" /> {metric.change}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. SPLIT 2-COLUMN LAYOUT */}
                  {currentSlide.layout === 'split' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
                      <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/80 space-y-2">
                        <div className="font-bold text-xs text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Manual Status Quo
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {(currentSlide.leftContent || [
                            'Fragmented notes and lost action items',
                            'Hours spent manually writing repetitive emails',
                            'Unprioritized to-do lists causing decision fatigue',
                          ]).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-red-500 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                        <div className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> AI Productivity Assistant
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-800">
                          {(currentSlide.rightContent || [
                            'Automated meeting synthesis with assigned owners',
                            'Instant audience-calibrated email generation',
                            'Eisenhower matrix prioritization & time blocks',
                          ]).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span className="font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 5. TIMELINE / ROADMAP LAYOUT */}
                  {currentSlide.layout === 'timeline' && currentSlide.cards && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
                      {currentSlide.cards.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-3.5 rounded-xl border relative ${themeStyle.cardBg}`}
                        >
                          <div className="text-[10px] font-bold text-indigo-600 mb-1">
                            PHASE 0{sIdx + 1}
                          </div>
                          <div className="font-bold text-xs text-slate-900 mb-1">{step.title}</div>
                          <p className={`text-xs ${themeStyle.secondaryText} leading-relaxed`}>
                            {step.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 6. BULLETS & SUMMARY DEFAULT LAYOUT */}
                  {(currentSlide.layout === 'bullets' || currentSlide.layout === 'summary') && (
                    <div className="space-y-2.5 my-auto">
                      {(currentSlide.bullets || [
                        'Structured workplace automation reducing daily communication drag',
                        'Clear milestone tracking with assigned deliverables and strict deadlines',
                        'Instant slide generation for executive presentation and team synchronization',
                      ]).map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${themeStyle.cardBg}`}
                        >
                          <div className="w-5 h-5 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {bIdx + 1}
                          </div>
                          <span className={`text-xs sm:text-sm font-medium ${themeStyle.primaryText} leading-relaxed`}>
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Slide Takeaway Pill */}
                {currentSlide.takeaway && (
                  <div
                    className={`mt-2 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${themeStyle.highlightBox}`}
                  >
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-medium leading-tight">
                      <strong className="font-bold">Key Takeaway:</strong> {currentSlide.takeaway}
                    </span>
                  </div>
                )}
              </div>

              {/* Speaker Notes Drawer */}
              {showSpeakerNotes && currentSlide.speakerNotes && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-800">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Presenter Talking Points & Script Notes
                  </div>
                  <p className="text-amber-900 leading-relaxed text-xs italic">
                    "{currentSlide.speakerNotes}"
                  </p>
                </div>
              )}

              {/* Thumbnails Carousel */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Slide Navigation ({currentDeck.slides.length} Slides)
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {currentDeck.slides.map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        activeSlideIndex === idx
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>SLIDE 0{idx + 1}</span>
                        <span className="uppercase text-[9px] font-semibold text-indigo-600">
                          {s.layout}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {s.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-inner">
                <Presentation className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ready to Generate Your PowerPoint Presentation
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configure your presentation topic on the left or choose one of our quick presets to create an executive PowerPoint deck with speaker notes and instant .pptx export.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
