import React from 'react';
import {
  LayoutDashboard,
  Mail,
  FileText,
  CheckSquare,
  Search,
  Presentation,
  FolderClock,
  Sparkles,
  Zap,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  hoursSaved: number;
  tasksCompleted: number;
  totalTasks: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hoursSaved,
  tasksCompleted,
  totalTasks,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & Quick Actions',
    },
    {
      id: 'email',
      label: 'Email Generator',
      icon: Mail,
      desc: 'Tone & audience-based',
    },
    {
      id: 'meeting',
      label: 'Meeting Summarizer',
      icon: FileText,
      desc: 'Actions, keys & deadlines',
    },
    {
      id: 'tasks',
      label: 'Task Planner',
      icon: CheckSquare,
      badge: `${tasksCompleted}/${totalTasks}`,
      desc: 'Eisenhower & scheduling',
    },
    {
      id: 'research',
      label: 'Research Assistant',
      icon: Search,
      desc: 'Insights & deep briefs',
    },
    {
      id: 'slides',
      label: 'PowerPoint Studio',
      icon: Presentation,
      desc: 'Instant .pptx slide decks',
    },
    {
      id: 'history',
      label: 'Saved Workspace',
      icon: FolderClock,
      desc: 'All drafts & reports',
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col h-full shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-tight leading-none">
              AI Workplace
            </h1>
            <span className="text-[11px] font-medium text-indigo-400 tracking-wide">
              Productivity Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <div className="font-semibold text-slate-200 truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </div>
              {item.badge ? (
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100 text-indigo-400' : 'text-slate-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Productivity Metric Card in Sidebar */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-slate-800/90 to-slate-800/40 border border-slate-700/60 shadow-inner">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Time Saved
          </span>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> ~{hoursSaved} hrs
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (hoursSaved / 10) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Automating emails, meetings & task planning this week.
        </p>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 -ml-3.5 rounded-full bg-emerald-400" />
          <span>Gemini AI 3.7 Active</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">v2.4</span>
      </div>
    </aside>
  );
};
