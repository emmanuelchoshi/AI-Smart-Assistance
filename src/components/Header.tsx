import React from 'react';
import {
  Sparkles,
  Command,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenCommandPalette: () => void;
  onQuickAction: (tab: NavigationTab) => void;
  hoursSaved: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenCommandPalette,
  onQuickAction,
  hoursSaved,
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Executive Productivity Dashboard',
          subtitle: 'Real-time AI workflow telemetry and automation command center',
        };
      case 'email':
        return {
          title: 'Smart Email Generator',
          subtitle: 'Tone-crafted, audience-targeted drafts with rapid revisions',
        };
      case 'meeting':
        return {
          title: 'Meeting Notes Summarizer',
          subtitle: 'Extract key decisions, structured action items, and clear deadlines',
        };
      case 'tasks':
        return {
          title: 'AI Task Planner & Scheduler',
          subtitle: 'Eisenhower prioritization and cognitive energy time-blocking',
        };
      case 'research':
        return {
          title: 'AI Research Assistant',
          subtitle: 'In-depth market synthesis, SWOT analysis, and strategic briefs',
        };
      case 'slides':
        return {
          title: 'PowerPoint Slide Deck Studio',
          subtitle: 'Generate professional executive presentation decks and export direct to .pptx',
        };
      case 'history':
        return {
          title: 'Saved Workspace Records',
          subtitle: 'Unified archive of all generated emails, summaries, and reports',
        };
      case 'analytics':
        return {
          title: 'Productivity Impact & ROI',
          subtitle: 'Metrics, reclaimed deep-work hours, and efficiency benchmarks',
        };
      default:
        return {
          title: 'AI Workplace Productivity Assistant',
          subtitle: 'Automate daily high-friction professional work tasks',
        };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      id="app-header"
      className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-10"
    >
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-500 hidden sm:block truncate max-w-lg">
          {subtitle}
        </p>
      </div>

      {/* Action Buttons & Utilities */}
      <div className="flex items-center gap-3">
        {/* Quick Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 text-xs font-medium text-slate-600 border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{today}</span>
        </div>

        {/* Global Command Palette / Search Trigger */}
        <button
          id="btn-command-palette-trigger"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-800 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
          title="Open AI Command Palette (Ctrl+K / Cmd+K)"
        >
          <Command className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline text-slate-500">Quick AI Assist</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-300 text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick New Draft Dropdown or Shortcut */}
        <button
          id="btn-quick-new-task"
          onClick={() => onQuickAction(activeTab === 'dashboard' ? 'email' : activeTab)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New AI Generation</span>
        </button>
      </div>
    </header>
  );
};
