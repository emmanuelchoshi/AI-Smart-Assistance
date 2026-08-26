import React, { useState } from 'react';
import {
  FolderClock,
  Search,
  Mail,
  FileText,
  CheckSquare,
  Presentation,
  Star,
  Trash2,
  Copy,
  Check,
  Download,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  EmailRecord,
  MeetingRecord,
  ResearchRecord,
  SlideDeckRecord,
  NavigationTab,
} from '../types';
import { exportToPptx } from '../utils/exportPptx';

interface WorkspaceHistoryViewProps {
  savedEmails: EmailRecord[];
  savedMeetings: MeetingRecord[];
  savedResearch: ResearchRecord[];
  savedSlides?: SlideDeckRecord[];
  onDeleteEmail: (id: string) => void;
  onDeleteMeeting: (id: string) => void;
  onDeleteResearch: (id: string) => void;
  onDeleteSlides?: (id: string) => void;
  onToggleFavoriteEmail: (id: string) => void;
  onToggleFavoriteMeeting: (id: string) => void;
  onToggleFavoriteResearch: (id: string) => void;
  onToggleFavoriteSlides?: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onSelectSlideDeck?: (deck: SlideDeckRecord) => void;
}

export const WorkspaceHistoryView: React.FC<WorkspaceHistoryViewProps> = ({
  savedEmails,
  savedMeetings,
  savedResearch,
  savedSlides = [],
  onDeleteEmail,
  onDeleteMeeting,
  onDeleteResearch,
  onDeleteSlides,
  onToggleFavoriteEmail,
  onToggleFavoriteMeeting,
  onToggleFavoriteResearch,
  onToggleFavoriteSlides,
  onNavigate,
  onSelectSlideDeck,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'emails' | 'meetings' | 'research' | 'slides' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Combine items into unified timeline
  interface UnifiedItem {
    id: string;
    type: 'email' | 'meeting' | 'research' | 'slides';
    title: string;
    snippet: string;
    timestamp: string;
    isFavorite: boolean;
    fullData: any;
  }

  const allItems: UnifiedItem[] = [
    ...savedEmails.map((e) => ({
      id: e.id,
      type: 'email' as const,
      title: e.purpose,
      snippet: e.result.summaryBullet || e.result.primaryDraft,
      timestamp: e.timestamp,
      isFavorite: !!e.isFavorite,
      fullData: e,
    })),
    ...savedMeetings.map((m) => ({
      id: m.id,
      type: 'meeting' as const,
      title: m.title,
      snippet: m.result.executiveSummary,
      timestamp: m.timestamp,
      isFavorite: !!m.isFavorite,
      fullData: m,
    })),
    ...savedResearch.map((r) => ({
      id: r.id,
      type: 'research' as const,
      title: r.result.title || r.topic,
      snippet: r.result.executiveSummary,
      timestamp: r.timestamp,
      isFavorite: !!r.isFavorite,
      fullData: r,
    })),
    ...savedSlides.map((s) => ({
      id: s.id,
      type: 'slides' as const,
      title: s.title || s.topic,
      snippet: `${s.result.slides.length} slides • ${s.result.subtitle || 'Executive presentation deck'}`,
      timestamp: s.timestamp,
      isFavorite: !!s.isFavorite,
      fullData: s,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredItems = allItems.filter((item) => {
    if (filterType === 'emails' && item.type !== 'email') return false;
    if (filterType === 'meetings' && item.type !== 'meeting') return false;
    if (filterType === 'research' && item.type !== 'research') return false;
    if (filterType === 'slides' && item.type !== 'slides') return false;
    if (filterType === 'favorites' && !item.isFavorite) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportAll = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      emails: savedEmails,
      meetings: savedMeetings,
      research: savedResearch,
      slides: savedSlides,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workplace-productivity-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="workspace-history-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FolderClock className="w-4 h-4 text-indigo-600" />
              Unified Saved Workspace Archive
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access, search, copy, or export all your generated workplace intelligence and presentations.
            </p>
          </div>

          <button
            onClick={handleExportAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Records (JSON)</span>
          </button>
        </div>

        {/* Filter Tabs & Search Query */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Tabs */}
          <div className="md:col-span-8 flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1">
            {[
              { id: 'all', label: `All (${allItems.length})` },
              { id: 'emails', label: `Emails (${savedEmails.length})` },
              { id: 'meetings', label: `Meetings (${savedMeetings.length})` },
              { id: 'research', label: `Research (${savedResearch.length})` },
              { id: 'slides', label: `Slides (${savedSlides.length})` },
              {
                id: 'favorites',
                label: `Starred (${allItems.filter((i) => i.isFavorite).length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across drafts & slides..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Items Grid / List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'email'
                      ? 'bg-indigo-50 text-indigo-600'
                      : item.type === 'meeting'
                      ? 'bg-violet-50 text-violet-600'
                      : item.type === 'research'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  {item.type === 'email' && <Mail className="w-4 h-4" />}
                  {item.type === 'meeting' && <FileText className="w-4 h-4" />}
                  {item.type === 'research' && <Search className="w-4 h-4" />}
                  {item.type === 'slides' && <Presentation className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.type === 'email'
                          ? 'bg-indigo-100/70 text-indigo-800'
                          : item.type === 'meeting'
                          ? 'bg-violet-100/70 text-violet-800'
                          : item.type === 'research'
                          ? 'bg-emerald-100/70 text-emerald-800'
                          : 'bg-purple-100/70 text-purple-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {item.snippet}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* PPTX Download if Slides */}
                {item.type === 'slides' && (
                  <button
                    onClick={() => exportToPptx(item.fullData.result, item.fullData.title)}
                    className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                    title="Download PowerPoint (.pptx)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* View / Open Slide Deck in Studio */}
                {item.type === 'slides' && (
                  <button
                    onClick={() => {
                      if (onSelectSlideDeck) onSelectSlideDeck(item.fullData);
                      onNavigate('slides');
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Open in Slide Studio"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Favorite Toggle */}
                <button
                  onClick={() => {
                    if (item.type === 'email') onToggleFavoriteEmail(item.id);
                    if (item.type === 'meeting') onToggleFavoriteMeeting(item.id);
                    if (item.type === 'research') onToggleFavoriteResearch(item.id);
                    if (item.type === 'slides' && onToggleFavoriteSlides) onToggleFavoriteSlides(item.id);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    item.isFavorite
                      ? 'bg-amber-50 border-amber-200 text-amber-500'
                      : 'border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                  title="Star Favorite"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Copy Text */}
                <button
                  onClick={() =>
                    handleCopy(
                      item.type === 'email'
                        ? item.fullData.result.primaryDraft
                        : item.snippet,
                      item.id
                    )
                  }
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Copy snippet"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (item.type === 'email') onDeleteEmail(item.id);
                    if (item.type === 'meeting') onDeleteMeeting(item.id);
                    if (item.type === 'research') onDeleteResearch(item.id);
                    if (item.type === 'slides' && onDeleteSlides) onDeleteSlides(item.id);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-200 text-center space-y-3">
            <FolderClock className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">
              No matching records found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generated emails, meeting summaries, research briefs, and PowerPoint decks will be saved here automatically.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => onNavigate('slides')}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100"
              >
                Create PowerPoint Slides
              </button>
              <button
                onClick={() => onNavigate('email')}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Draft an Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
