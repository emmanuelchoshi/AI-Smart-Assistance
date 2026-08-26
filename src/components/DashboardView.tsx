import React, { useState } from 'react';
import {
  Mail,
  FileText,
  CheckSquare,
  Search,
  Presentation,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  Copy,
  Check,
  Send,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import {
  NavigationTab,
  ProductivityStats,
  PlannedTask,
  EmailRecord,
  MeetingRecord,
  ResearchRecord,
} from '../types';

interface DashboardViewProps {
  stats: ProductivityStats;
  tasks: PlannedTask[];
  onToggleTask: (taskId: string) => void;
  recentEmails: EmailRecord[];
  recentMeetings: MeetingRecord[];
  recentResearch: ResearchRecord[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenQuickAssist: (initialText?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  tasks,
  onToggleTask,
  recentEmails,
  recentMeetings,
  recentResearch,
  onNavigate,
  onOpenQuickAssist,
}) => {
  const [quickCopilotInput, setQuickCopilotInput] = useState('');
  const [quickCopilotLoading, setQuickCopilotLoading] = useState(false);
  const [quickCopilotOutput, setQuickCopilotOutput] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCopilotInput.trim() || quickCopilotLoading) return;

    setQuickCopilotLoading(true);
    setQuickCopilotOutput(null);

    try {
      const response = await fetch('/api/ai/quick-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rewrite',
          text: quickCopilotInput,
          context: 'Workplace daily productivity dashboard query',
        }),
      });
      const data = await response.json();
      if (data.result) {
        setQuickCopilotOutput(data.result);
      }
    } catch (err) {
      setQuickCopilotOutput(`Quick polish: ${quickCopilotInput}`);
    } finally {
      setQuickCopilotLoading(false);
    }
  };

  const highPriorityTasks = tasks.filter(
    (t) => t.priorityScore === 'P1' || t.priorityScore === 'P2'
  );

  return (
    <div id="dashboard-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Quick Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Time Saved */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reclaimed Capacity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ~{stats.estimatedHoursSaved}{' '}
              <span className="text-sm font-medium text-slate-500">hours</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <span>+3.4 hrs saved this week</span>
            </p>
          </div>
        </div>

        {/* Stat 2: Smart Emails */}
        <div 
          onClick={() => onNavigate('email')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Emails Drafted
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-center justify-between">
              <span>{stats.emailsDrafted}</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Avg. 4.2 mins saved per email
            </p>
          </div>
        </div>

        {/* Stat 3: Meetings Summarized */}
        <div 
          onClick={() => onNavigate('meeting')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-violet-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Meetings Synthesized
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-center justify-between">
              <span>{stats.meetingsSummarized}</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              100% structured action extraction
            </p>
          </div>
        </div>

        {/* Stat 4: Tasks Planned */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Daily Priorities
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-center justify-between">
              <span>
                {stats.tasksCompleted}/{stats.totalTasksPlanned}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    stats.totalTasksPlanned > 0
                      ? (stats.tasksCompleted / stats.totalTasksPlanned) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Core Action Hub: 4 Main Productivity Engines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            AI Productivity Workspaces
          </h3>
          <span className="text-xs text-slate-400 font-medium">Select a tool to automate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Smart Email */}
          <div
            id="hub-email-card"
            onClick={() => onNavigate('email')}
            className="group relative bg-white hover:bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                Smart Email Generator
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Audience-tailored drafts with instant executive subject options and tones.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Launch Drafter</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Meeting Summarizer */}
          <div
            id="hub-meeting-card"
            onClick={() => onNavigate('meeting')}
            className="group relative bg-white hover:bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-violet-600 transition-colors">
                Meeting Summarizer
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Extract owners, deadlines, key decisions, and structured next agendas.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-600">
              <span>Summarize Notes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Task Planner */}
          <div
            id="hub-tasks-card"
            onClick={() => onNavigate('tasks')}
            className="group relative bg-white hover:bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-600 transition-colors">
                AI Task Planner
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Eisenhower matrix prioritization combined with cognitive energy time-blocks.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Organize Tasks</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Research Assistant */}
          <div
            id="hub-research-card"
            onClick={() => onNavigate('research')}
            className="group relative bg-white hover:bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-600 transition-colors">
                Research Assistant
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Executive intelligence briefs with benchmarks, SWOT, and strategic advice.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Research Topic</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: PowerPoint Slide Deck Studio */}
          <div
            id="hub-slides-card"
            onClick={() => onNavigate('slides')}
            className="group relative bg-gradient-to-br from-indigo-50/50 to-purple-50/50 hover:bg-indigo-50 rounded-xl p-4 sm:p-5 border border-indigo-200/80 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Presentation className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-200/60 text-indigo-900 rounded">
                  NEW • PPTX
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                PowerPoint Studio
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Instant executive presentations from chat & notes with real .pptx export.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Create Slides</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Dual Section: Instant AI Copilot Bar & Today's High Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Instant AI Workplace Copilot */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">
                  Instant Workplace AI Copilot
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                Gemini 3.7 Fast Response
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Type any instant request: rephrase an email, condense bullets, draft a quick agenda, or decompose a task.
            </p>

            {/* Form */}
            <form onSubmit={handleQuickCopilotSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={quickCopilotInput}
                  onChange={(e) => setQuickCopilotInput(e.target.value)}
                  placeholder="e.g., Rewrite this polite follow-up: 'Need that spreadsheet ASAP for the director review'..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner pr-24"
                />
                <button
                  type="submit"
                  disabled={quickCopilotLoading || !quickCopilotInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {quickCopilotLoading ? (
                    <span className="animate-spin text-xs">●</span>
                  ) : (
                    <>
                      <span>Polish</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Instant Output if Available */}
            {quickCopilotOutput && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 text-xs text-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> AI Refined
                    Output
                  </span>
                  <button
                    onClick={() => handleCopy(quickCopilotOutput, 'copilot-out')}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedId === 'copilot-out' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedId === 'copilot-out' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                  {quickCopilotOutput}
                </div>
              </div>
            )}
          </div>

          {/* Preset Pill Triggers */}
          <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-medium">Quick Prompts:</span>
            {[
              'Draft quick meeting invite for budget sync',
              'Make this message diplomatic & concise',
              'Extract 3 action items from notes',
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuickCopilotInput(prompt)}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Today's High Priority Tasks Checklist */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Priority Action List (P1 / P2)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                <span>Planner</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              High-impact Eisenhower quadrant tasks for today.
            </p>

            {/* Task Item List */}
            <div className="space-y-2">
              {highPriorityTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600">
                        {task.priorityScore}
                      </span>
                      <span>{task.estimatedMinutes} mins</span>
                      {task.recommendedTime && (
                        <span>• {task.recommendedTime}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {highPriorityTasks.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active P1/P2 tasks for today. Great job!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
              done
            </span>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Add Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Recent AI Workspace Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Recent AI Activity & Saved Drafts
          </h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Saved Items</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latest Email */}
          {recentEmails[0] ? (
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email Draft
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(recentEmails[0].timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">
                  {recentEmails[0].purpose}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {recentEmails[0].result.summaryBullet ||
                    recentEmails[0].result.primaryDraft}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Tone: {recentEmails[0].tone}
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      recentEmails[0].result.primaryDraft,
                      `recent-email-${recentEmails[0].id}`
                    )
                  }
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedId === `recent-email-${recentEmails[0].id}` ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>
                    {copiedId === `recent-email-${recentEmails[0].id}`
                      ? 'Copied'
                      : 'Copy Draft'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-dashed border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center justify-center py-8">
              <Mail className="w-6 h-6 text-slate-300 mb-2" />
              <span>No emails generated yet</span>
            </div>
          )}

          {/* Latest Meeting */}
          {recentMeetings[0] ? (
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 font-semibold text-[10px] flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Meeting Summary
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(recentMeetings[0].timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">
                  {recentMeetings[0].title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {recentMeetings[0].result.executiveSummary}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {recentMeetings[0].result.actionItems.length} Actions Tracked
                </span>
                <button
                  onClick={() => onNavigate('meeting')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-dashed border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center justify-center py-8">
              <FileText className="w-6 h-6 text-slate-300 mb-2" />
              <span>No meeting notes summarized yet</span>
            </div>
          )}

          {/* Latest Research */}
          {recentResearch[0] ? (
            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                    <Search className="w-3 h-3" /> Research Brief
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(recentResearch[0].timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">
                  {recentResearch[0].result.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {recentResearch[0].result.executiveSummary}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {recentResearch[0].result.keyFindings.length} Key Insights
                </span>
                <button
                  onClick={() => onNavigate('research')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Read Brief</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-dashed border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center justify-center py-8">
              <Search className="w-6 h-6 text-slate-300 mb-2" />
              <span>No research briefs created yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
