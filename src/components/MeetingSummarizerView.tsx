import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Bookmark,
  BookmarkCheck,
  CheckSquare,
  Users,
  Calendar,
  AlertTriangle,
  HelpCircle,
  ListPlus,
  ArrowRight,
  Send,
  Plus,
} from 'lucide-react';
import {
  MeetingType,
  MeetingResult,
  MeetingRecord,
  MeetingActionItem,
  PlannedTask,
} from '../types';

interface MeetingSummarizerViewProps {
  onSaveMeeting: (record: MeetingRecord) => void;
  onAddTasksToPlanner: (tasks: PlannedTask[]) => void;
  savedMeetings: MeetingRecord[];
}

export const MeetingSummarizerView: React.FC<MeetingSummarizerViewProps> = ({
  onSaveMeeting,
  onAddTasksToPlanner,
  savedMeetings,
}) => {
  const [title, setTitle] = useState('Sprint 28 Roadmap & Client Architecture Alignment');
  const [meetingType, setMeetingType] = useState<MeetingType>('Weekly Team Sync');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendees, setAttendees] = useState('Alex Chen (Lead), Sarah (PM), David (Backend), Maya (Frontend)');
  const [rawNotes, setRawNotes] = useState('');
  const [focusArea, setFocusArea] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [addedTasksCount, setAddedTasksCount] = useState<number | null>(null);

  const MEETING_TYPES: MeetingType[] = [
    'Weekly Team Sync',
    '1-on-1 Check-in',
    'Executive Strategy',
    'Sprint Retrospective',
    'Client Kickoff / Demo',
    'Project Postmortem',
    'Brainstorming Session',
  ];

  const SAMPLE_NOTES = `Sprint 28 sync started at 10:00 AM.
Attendees: Alex, Sarah, David, Maya.
Agenda: Review feedback on new enterprise SSO integration and upcoming billing revamp.

Discussion:
- Sarah presented client feedback from Acme Corp demo. They loved the analytics speed but raised concerns on SAML SSO configuration complexity.
- David mentioned the backend SAML metadata parser is 90% done. Still needs error telemetry for corrupted XML certificates. Estimated 1.5 days of work.
- Maya demoed the updated self-serve admin wizard for SSO setup. Sarah approved the UI. Maya needs backend endpoint documentation by Wednesday.
- Billing revamp discussion: We need to transition from Stripe legacy webhooks to v3 API before the end of next month.
- Budget review: Third-party security penetration testing quote came in at $4,500. Alex confirmed executive sponsor approval.

Decisions:
1. SAML SSO will ship in beta next Friday to Acme Corp and 2 select design partners.
2. Pen testing will commence on the 15th.
3. We will defer custom role permissions to Q4 to prioritize billing API stability.

Action Items:
- David: Finish SAML XML certificate validation and push API swagger docs by Wednesday 5 PM. (High priority)
- Maya: Implement error toast states in the admin wizard and run responsive tests on Safari. (Medium priority, due Thursday)
- Alex: Coordinate sign-off with security team and schedule pen testing vendor kickoff. (High priority, due Friday)
- Sarah: Send beta onboarding email and release notes draft to Acme Corp lead. (Medium priority, due next Monday)`;

  const handleLoadSample = () => {
    setTitle('Enterprise SSO & Billing Architecture Review');
    setMeetingType('Weekly Team Sync');
    setAttendees('Alex Chen (Lead), Sarah (PM), David (Backend), Maya (Frontend)');
    setRawNotes(SAMPLE_NOTES);
  };

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawNotes.trim()) return;

    setLoading(true);
    setIsSaved(false);
    setAddedTasksCount(null);

    try {
      const response = await fetch('/api/ai/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          meetingType,
          date,
          attendees,
          rawNotes,
          focusArea,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error('Meeting summarizer failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWorkspace = () => {
    if (!result) return;
    const newRecord: MeetingRecord = {
      id: `meeting-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      meetingType,
      date,
      attendees,
      rawNotes,
      result,
      isFavorite: true,
    };
    onSaveMeeting(newRecord);
    setIsSaved(true);
  };

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportFullMarkdown = () => {
    if (!result) return;
    const md = `# Meeting Summary: ${title}
**Date:** ${date} | **Type:** ${meetingType}
**Attendees:** ${attendees}

## Executive Summary
${result.executiveSummary}

## Key Discussion Points
${result.keyDiscussionPoints.map((p) => `- ${p}`).join('\n')}

## Action Items & Deadlines
| Task | Assignee | Priority | Deadline | Status |
|---|---|---|---|---|
${result.actionItems
  .map((a) => `| ${a.task} | ${a.assignee} | ${a.priority} | ${a.deadline} | ${a.status} |`)
  .join('\n')}

## Key Decisions Made
${result.decisionsMade.map((d) => `✓ ${d}`).join('\n')}

## Open Questions & Blockers
${result.openQuestions.map((q) => `? ${q}`).join('\n')}

## Next Meeting Suggested Agenda
${result.suggestedNextAgenda.map((ag) => `1. ${ag}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-summary-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportActionsToPlanner = () => {
    if (!result || !result.actionItems.length) return;
    const newTasks: PlannedTask[] = result.actionItems.map((item, index) => ({
      id: `task-m-${Date.now()}-${index}`,
      title: item.task,
      description: `Assigned: ${item.assignee} | Deadline: ${item.deadline} (from meeting: ${title})`,
      eisenhowerQuadrant:
        item.priority === 'High'
          ? 'Do First (Urgent & Important)'
          : 'Schedule (Important, Not Urgent)',
      priorityScore: item.priority === 'High' ? 'P1' : item.priority === 'Medium' ? 'P2' : 'P3',
      estimatedMinutes: item.priority === 'High' ? 60 : 30,
      energyRequired: item.priority === 'High' ? 'High' : 'Medium',
      category: 'Meeting',
      completed: false,
    }));

    onAddTasksToPlanner(newTasks);
    setAddedTasksCount(newTasks.length);
  };

  return (
    <div id="meeting-summarizer-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Quick Sample Loader Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Transform disorganized notes or transcripts into structured intelligence</span>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          className="px-3 py-1 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-lg text-violet-700 font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          Load Realistic Meeting Transcript Sample
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Meeting Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" />
              Meeting Context & Transcript
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Input Notes</span>
          </div>

          <form onSubmit={handleSummarize} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Product & Sprint Review"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Type & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Type
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-violet-500 cursor-pointer"
                >
                  {MEETING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-violet-500"
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Attendees & Stakeholders
              </label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="e.g., Alex (Lead), Sarah (PM), David (Eng)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-violet-500"
              />
            </div>

            {/* Raw Notes / Audio Transcript */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raw Notes / Audio Transcript <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={9}
                placeholder="Paste your raw, messy notes, bullets, or automated audio transcription here..."
                required
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500 font-sans leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !rawNotes.trim()}
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-violet-600/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Actions, Decisions & Deadlines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Meeting Intelligence</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Structured Analysis Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
              {/* Header with Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{meetingType}</span>
                    <span>•</span>
                    <span>{date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToWorkspace}
                    className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Save to Workspace"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleExportFullMarkdown}
                    className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Export as Markdown document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary Callout */}
              <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200 text-xs text-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-violet-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Executive TL;DR
                  </span>
                  <button
                    onClick={() => handleCopy(result.executiveSummary, 'summary')}
                    className="text-violet-700 hover:text-violet-900 cursor-pointer text-[11px] font-medium"
                  >
                    {copiedSection === 'summary' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="leading-relaxed text-slate-700">{result.executiveSummary}</p>
              </div>

              {/* 2. Action Items & Deadlines Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Action Items ({result.actionItems.length})
                  </h5>
                  <button
                    onClick={handleExportActionsToPlanner}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>
                      {addedTasksCount !== null
                        ? `Synced ${addedTasksCount} to Planner ✓`
                        : 'Send All to Task Planner'}
                    </span>
                  </button>
                </div>

                <div className="space-y-2">
                  {result.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs flex items-start justify-between gap-3 transition-colors shadow-2xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold text-slate-900">{item.task}</div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                            <Users className="w-3 h-3 text-slate-400" /> {item.assignee}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                              item.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : item.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.priority} Priority
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" /> {item.deadline}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Key Discussion Points */}
              <div>
                <h5 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                  Key Discussion Points
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {result.keyDiscussionPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Decisions Made & Open Blockers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {/* Decisions */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Decisions Agreed
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {result.decisionsMade.map((dec, idx) => (
                      <li key={idx} className="text-[11px] leading-relaxed">
                        • {dec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Blockers & Open Questions */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Open Questions
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {result.openQuestions.map((q, idx) => (
                      <li key={idx} className="text-[11px] leading-relaxed">
                        • {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. Next Meeting Agenda Draft */}
              {result.suggestedNextAgenda?.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1">
                  <span className="font-bold text-indigo-900 text-xs">
                    Recommended Agenda for Next Meeting:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.suggestedNextAgenda.map((ag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-950 font-medium text-[11px]"
                      >
                        {idx + 1}. {ag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[420px] bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                No Meeting Summary Generated Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                Paste meeting transcripts or quick bullet notes on the left, or click “Load Sample” above to see action item extraction in action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
