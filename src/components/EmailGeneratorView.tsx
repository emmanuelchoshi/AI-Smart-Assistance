import React, { useState } from 'react';
import {
  Mail,
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sliders,
  Users,
  MessageSquare,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Download,
  ListOrdered,
  FileEdit,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  EmailTone,
  EmailAudience,
  EmailLength,
  EmailResult,
  EmailRecord,
} from '../types';

interface EmailGeneratorViewProps {
  onSaveEmail: (record: EmailRecord) => void;
  savedEmails: EmailRecord[];
}

export const EmailGeneratorView: React.FC<EmailGeneratorViewProps> = ({
  onSaveEmail,
  savedEmails,
}) => {
  // Input states
  const [purpose, setPurpose] = useState('');
  const [audience, setAudience] = useState<EmailAudience>('Client / Customer');
  const [tone, setTone] = useState<EmailTone>('Warm & Professional');
  const [length, setLength] = useState<EmailLength>('Standard (2-3 Paragraphs)');
  const [keyPoints, setKeyPoints] = useState('');
  const [threadContext, setThreadContext] = useState('');
  const [senderName, setSenderName] = useState('Alex Chen');
  const [recipientName, setRecipientName] = useState('Sarah');
  const [includeCta, setIncludeCta] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showThreadContext, setShowThreadContext] = useState(false);

  // Output states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [activeDraftTab, setActiveDraftTab] = useState<'primary' | 'alternative'>('primary');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [editedDraft, setEditedDraft] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [refining, setRefining] = useState(false);

  const TONES: EmailTone[] = [
    'Executive & Concise',
    'Warm & Professional',
    'Diplomatic & Assertive',
    'Urgent & Direct',
    'Persuasive & Pitch',
    'Friendly & Casual',
  ];

  const AUDIENCES: EmailAudience[] = [
    'Executive / C-Suite',
    'Client / Customer',
    'Team / Direct Report',
    'Cross-functional Partner',
    'Vendor / Supplier',
    'External Candidate / Recruiter',
  ];

  const LENGTHS: EmailLength[] = [
    'Concise (Bullets & TL;DR)',
    'Standard (2-3 Paragraphs)',
    'Comprehensive (Detailed)',
  ];

  const TEMPLATES = [
    {
      title: 'Project Status Update',
      purpose: 'Bi-weekly project status update and milestone deliverables',
      tone: 'Executive & Concise' as EmailTone,
      audience: 'Executive / C-Suite' as EmailAudience,
      keyPoints: 'Milestone 1 completed 2 days ahead of schedule\nTesting showed 99.8% uptime reliability\nMilestone 2 kickoff slated for next Monday',
    },
    {
      title: 'Client Deliverable & Signoff',
      purpose: 'Delivering revised proposal and requesting official sign-off',
      tone: 'Warm & Professional' as EmailTone,
      audience: 'Client / Customer' as EmailAudience,
      keyPoints: 'Incorporated all feedback from Tuesday sync\nUpdated pricing matrix with 10% multi-year discount\nNeed signed agreement by Friday to hold onboarding slot',
    },
    {
      title: 'Escalation / Blocker Resolution',
      purpose: 'Escalating cross-department dependency blocking sprint launch',
      tone: 'Diplomatic & Assertive' as EmailTone,
      audience: 'Cross-functional Partner' as EmailAudience,
      keyPoints: 'Backend API migration is currently waiting on security audit sign-off\nDelay threatens the scheduled customer release date\nRequesting a 15-min alignment sync this afternoon',
    },
  ];

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setPurpose(tmpl.purpose);
    setTone(tmpl.tone);
    setAudience(tmpl.audience);
    setKeyPoints(tmpl.keyPoints);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!purpose.trim()) return;

    setLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch('/api/ai/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          audience,
          tone,
          length,
          keyPoints,
          threadContext: showThreadContext ? threadContext : undefined,
          senderName,
          recipientName,
          includeCta,
          customInstructions,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        setSelectedSubject(data.subjectOptions?.[0] || '');
        setEditedDraft(data.primaryDraft || '');
        setActiveDraftTab('primary');
      }
    } catch (err) {
      console.error('Email generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (action: 'shorten' | 'formalize' | 'bulletize') => {
    if (!editedDraft || refining) return;
    setRefining(true);

    try {
      const response = await fetch('/api/ai/quick-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: editedDraft,
          context: `Email to ${audience} with tone ${tone}`,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setEditedDraft(data.result);
      }
    } catch (err) {
      console.error('Refine failed', err);
    } finally {
      setRefining(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveToWorkspace = () => {
    if (!result) return;
    const newRecord: EmailRecord = {
      id: `email-${Date.now()}`,
      timestamp: new Date().toISOString(),
      purpose,
      audience,
      tone,
      result: {
        ...result,
        primaryDraft: editedDraft,
      },
      isFavorite: true,
    };
    onSaveEmail(newRecord);
    setIsSaved(true);
  };

  const handleOpenMailto = () => {
    const subjectEncoded = encodeURIComponent(selectedSubject || 'Workplace Update');
    const bodyEncoded = encodeURIComponent(editedDraft);
    window.location.href = `mailto:?subject=${subjectEncoded}&body=${bodyEncoded}`;
  };

  const handleDownloadTxt = () => {
    const fullText = `Subject: ${selectedSubject}\n\n${editedDraft}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-draft-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="email-generator-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Template Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Email Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="px-3 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Email Configuration
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Step 1 of 2</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Purpose / Objective <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Request budget approval for Q3 analytics tooling"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Names row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Sarah Jenkins"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender Name / Sign-off
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g., Alex Chen"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as EmailAudience)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
              >
                {AUDIENCES.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            {/* Desired Tone Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-400" /> Desired Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer truncate ${
                      tone === t
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Length & Structure
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {LENGTHS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer truncate ${
                      length === l
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {l.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Points */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Points / Bullets to Include
              </label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={3}
                placeholder="• Completed sprint deliverables on time&#10;• Identified 1 blocker in testing&#10;• Need confirmation by end of week"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Optional Past Thread Context Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setShowThreadContext(!showThreadContext)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{showThreadContext ? 'Hide' : '+ Add'} Email Thread Reply Context</span>
              </button>
              {showThreadContext && (
                <textarea
                  value={threadContext}
                  onChange={(e) => setThreadContext(e.target.value)}
                  rows={3}
                  placeholder="Paste the email you are replying to here..."
                  className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              )}
            </div>

            {/* Options */}
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCta}
                  onChange={(e) => setIncludeCta(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Include clear Call to Action (CTA)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !purpose.trim()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Multi-Tone Email Drafts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Email Draft</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Interactive Results & Dual Draft Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
              {/* Header with Draft Tabs and Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                {/* Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setActiveDraftTab('primary');
                      setEditedDraft(result.primaryDraft);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeDraftTab === 'primary'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Draft Option A (Standard)
                  </button>
                  <button
                    onClick={() => {
                      setActiveDraftTab('alternative');
                      setEditedDraft(result.alternativeDraft);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeDraftTab === 'alternative'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Draft Option B (Alternate)
                  </button>
                </div>

                {/* Actions */}
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
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Export as Text"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  <button
                    onClick={handleOpenMailto}
                    className="p-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Open in default Email Client (Outlook / Mail)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Mail</span>
                  </button>
                </div>
              </div>

              {/* Subject Line Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>AI Generated Subject Lines:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Click any subject to select
                  </span>
                </label>
                <div className="space-y-1.5">
                  {result.subjectOptions.map((subj, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSubject(subj)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        selectedSubject === subj
                          ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{subj}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(subj, `subj-${idx}`);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
                      >
                        {copiedField === `subj-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Body Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Body (Editable)</span>
                  </label>
                  <button
                    onClick={() => handleCopy(editedDraft, 'draft-body')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'draft-body' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'draft-body' ? 'Copied' : 'Copy Full Draft'}</span>
                  </button>
                </div>
                <textarea
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  rows={11}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-sans text-xs text-slate-800 leading-relaxed bg-slate-50/40"
                />
              </div>

              {/* Instant AI Modifier Toolbar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Instant AI Polish:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={refining}
                    onClick={() => handleRefine('shorten')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {refining ? '...' : 'Make Shorter'}
                  </button>
                  <button
                    type="button"
                    disabled={refining}
                    onClick={() => handleRefine('formalize')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {refining ? '...' : 'More Formal'}
                  </button>
                  <button
                    type="button"
                    disabled={refining}
                    onClick={() => handleRefine('bulletize')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {refining ? '...' : 'Convert to Bullets'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Ready to Draft High-Impact Emails
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                Configure your purpose, audience, and tone on the left to generate executive-ready drafts with subject options and instant polish tools.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
