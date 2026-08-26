import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { ResearchResult, ResearchRecord } from '../types';

interface ResearchAssistantViewProps {
  onSaveResearch: (record: ResearchRecord) => void;
  savedResearch: ResearchRecord[];
}

export const ResearchAssistantView: React.FC<ResearchAssistantViewProps> = ({
  onSaveResearch,
  savedResearch,
}) => {
  const [topic, setTopic] = useState('Enterprise Adoption of Autonomous AI Workplace Agents');
  const [depth, setDepth] = useState('In-Depth Market Analysis');
  const [industry, setIndustry] = useState('Enterprise B2B Software & Operations');
  const [targetAudience, setTargetAudience] = useState('Executive Leadership & Product Leads');
  const [specificQuestions, setSpecificQuestions] = useState(
    'What are the measurable ROI metrics for workplace automation?\nWhat are primary data security and governance concerns?'
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const RESEARCH_PRESETS = [
    {
      title: 'Workplace AI Agent ROI',
      topic: 'Measurable ROI & Time Savings of AI Workplace Automation Agents in 2026',
      industry: 'Enterprise Knowledge Work',
      questions: 'What is the average hours reclaimed per knowledge worker?\nHow does structured task planning affect sprint completion?',
    },
    {
      title: 'B2B SaaS Pricing Trends',
      topic: 'Outcome-Based and Usage-Based Pricing Models in Modern B2B SaaS',
      industry: 'Cloud Software & FinTech',
      questions: 'How are tier-1 SaaS companies packaging AI copilot features?\nWhat are average net revenue retention (NRR) benchmarks?',
    },
    {
      title: 'Remote Async Culture',
      topic: 'Operational Frameworks for High-Velocity Asynchronous Product Teams',
      industry: 'Technology & Distributed Work',
      questions: 'What documentation standards replace recurring status meetings?\nHow do top engineering teams minimize context switching?',
    },
  ];

  const handleApplyPreset = (p: typeof RESEARCH_PRESETS[0]) => {
    setTopic(p.topic);
    setIndustry(p.industry);
    setSpecificQuestions(p.questions);
  };

  const handleResearch = async (overrideTopic?: string) => {
    const queryTopic = overrideTopic || topic;
    if (!queryTopic.trim()) return;

    setLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: queryTopic,
          depth,
          industry,
          targetAudience,
          specificQuestions,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error('Research failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWorkspace = () => {
    if (!result) return;
    const newRecord: ResearchRecord = {
      id: `research-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic,
      depth,
      industry,
      result,
      isFavorite: true,
    };
    onSaveResearch(newRecord);
    setIsSaved(true);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const md = `# ${result.title}
**Topic:** ${topic} | **Industry:** ${industry} | **Depth:** ${depth}

## Executive Summary
${result.executiveSummary}

## Key Findings & Data Points
${result.keyFindings.map((f) => `### ${f.statOrFact}\n${f.detail}`).join('\n\n')}

## Market & Industry Trends
${result.marketTrends.map((t) => `- ${t}`).join('\n')}

## Strategic Analysis (SWOT)
### Strengths & Proven Upside
${result.swotOrProsCons.strengths.map((s) => `+ ${s}`).join('\n')}

### Challenges & Risks
${result.swotOrProsCons.challenges.map((c) => `- ${c}`).join('\n')}

### Strategic Opportunities
${result.swotOrProsCons.opportunities.map((o) => `* ${o}`).join('\n')}

## Actionable Recommendations
${result.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-brief-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="research-assistant-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Preset Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Research Brief Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {RESEARCH_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-emerald-800 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Research Configuration Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              Research Query & Parameters
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Topic Setup</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResearch();
            }}
            className="space-y-4"
          >
            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Research Topic / Inquiry <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g., Impact of asynchronous work on developer productivity and burnout"
                required
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Depth & Industry */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Analysis Depth
                </label>
                <select
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Quick Executive Brief">Quick Executive Brief (5-min)</option>
                  <option value="In-Depth Market Analysis">In-Depth Market Analysis</option>
                  <option value="Competitive Comparison & SWOT">Competitive & SWOT Brief</option>
                  <option value="Trend & Forecast Synthesis">Trend & Forecast Synthesis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Enterprise SaaS"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience / Stakeholder
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., VP of Product, Engineering Directors"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Specific Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Questions to Address (Optional)
              </label>
              <textarea
                value={specificQuestions}
                onChange={(e) => setSpecificQuestions(e.target.value)}
                rows={3}
                placeholder="What are the top 3 friction points? What tools are leaders using?"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Intelligence Brief...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Research Brief</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Structured Research Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
              {/* Header with Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{result.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{industry}</span>
                    <span>•</span>
                    <span>{depth}</span>
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
                    onClick={handleExportMarkdown}
                    className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Export as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-950 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Executive Synthesis
                  </span>
                  <button
                    onClick={() => handleCopy(result.executiveSummary, 'research-sum')}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-[11px] font-medium"
                  >
                    {copiedSection === 'research-sum' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="leading-relaxed text-slate-700">{result.executiveSummary}</p>
              </div>

              {/* 2. Key Findings & Data Cards */}
              <div>
                <h5 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Findings & Benchmark Stats
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.keyFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs space-y-1 transition-all shadow-2xs"
                    >
                      <div className="font-bold text-emerald-700 text-xs">
                        {finding.statOrFact}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {finding.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Market Trends */}
              <div>
                <h5 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Market Shifts & Emerging Dynamics
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {result.marketTrends.map((trend, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. SWOT / Strategic Analysis */}
              {result.swotOrProsCons && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  {/* Strengths */}
                  <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Strengths
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {result.swotOrProsCons.strengths?.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div className="p-3 rounded-xl bg-rose-50/40 border border-rose-200 space-y-1">
                    <div className="text-xs font-bold text-rose-900 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> Risks / Barriers
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {result.swotOrProsCons.challenges?.map((c, idx) => (
                        <li key={idx}>• {c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-1">
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-indigo-600" /> Opportunities
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {result.swotOrProsCons.opportunities?.map((o, idx) => (
                        <li key={idx}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 5. Strategic Actionable Recommendations */}
              <div>
                <h5 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Strategic Actionable Recommendations
                </h5>
                <div className="space-y-1.5">
                  {result.actionableRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Follow-up Topics (Clickable Drill Down) */}
              {result.suggestedFollowUpTopics?.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-800 text-xs">
                    Drill-Down Questions & Next Research Topics:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedFollowUpTopics.map((topicItem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTopic(topicItem);
                          handleResearch(topicItem);
                        }}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{topicItem}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[420px] bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                No Research Brief Generated Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                Enter your research topic or select one of the strategic presets above to generate a comprehensive workplace analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
