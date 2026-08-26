import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  EmailRecord,
  MeetingRecord,
  PlannedTask,
  ResearchRecord,
  SlideDeckRecord,
} from './types';
import {
  getSavedEmails,
  saveEmailRecord,
  deleteEmailRecord,
  toggleFavoriteEmail,
  getSavedMeetings,
  saveMeetingRecord,
  deleteMeetingRecord,
  toggleFavoriteMeeting,
  getActiveTasks,
  saveActiveTasks,
  getSavedResearch,
  saveResearchRecord,
  deleteResearchRecord,
  toggleFavoriteResearch,
  getSavedSlideDecks,
  saveSlideDeckRecord,
  deleteSlideDeckRecord,
  toggleFavoriteSlideDeck,
  calculateProductivityStats,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmailGeneratorView } from './components/EmailGeneratorView';
import { MeetingSummarizerView } from './components/MeetingSummarizerView';
import { TaskPlannerView } from './components/TaskPlannerView';
import { ResearchAssistantView } from './components/ResearchAssistantView';
import { SlideGeneratorView } from './components/SlideGeneratorView';
import { WorkspaceHistoryView } from './components/WorkspaceHistoryView';
import { QuickAssistModal } from './components/QuickAssistModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [tasks, setTasks] = useState<PlannedTask[]>([]);
  const [research, setResearch] = useState<ResearchRecord[]>([]);
  const [slides, setSlides] = useState<SlideDeckRecord[]>([]);
  const [selectedSlideDeck, setSelectedSlideDeck] = useState<SlideDeckRecord | null>(null);
  const [isQuickAssistOpen, setIsQuickAssistOpen] = useState(false);

  // Initialize stored state
  useEffect(() => {
    setEmails(getSavedEmails());
    setMeetings(getSavedMeetings());
    setTasks(getActiveTasks());
    setResearch(getSavedResearch());
    setSlides(getSavedSlideDecks());
  }, []);

  // Sync tasks changes
  const handleUpdateTasks = (newTasks: PlannedTask[]) => {
    setTasks(newTasks);
    saveActiveTasks(newTasks);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    handleUpdateTasks(updated);
  };

  // Add tasks directly from meeting summaries
  const handleAddTasksFromMeeting = (newTasks: PlannedTask[]) => {
    const merged = [...newTasks, ...tasks];
    handleUpdateTasks(merged);
  };

  // Email handlers
  const handleSaveEmail = (record: EmailRecord) => {
    const updated = saveEmailRecord(record);
    setEmails(updated);
  };

  const handleDeleteEmail = (id: string) => {
    const updated = deleteEmailRecord(id);
    setEmails(updated);
  };

  const handleToggleFavoriteEmail = (id: string) => {
    const updated = toggleFavoriteEmail(id);
    setEmails(updated);
  };

  // Meeting handlers
  const handleSaveMeeting = (record: MeetingRecord) => {
    const updated = saveMeetingRecord(record);
    setMeetings(updated);
  };

  const handleDeleteMeeting = (id: string) => {
    const updated = deleteMeetingRecord(id);
    setMeetings(updated);
  };

  const handleToggleFavoriteMeeting = (id: string) => {
    const updated = toggleFavoriteMeeting(id);
    setMeetings(updated);
  };

  // Research handlers
  const handleSaveResearch = (record: ResearchRecord) => {
    const updated = saveResearchRecord(record);
    setResearch(updated);
  };

  const handleDeleteResearch = (id: string) => {
    const updated = deleteResearchRecord(id);
    setResearch(updated);
  };

  const handleToggleFavoriteResearch = (id: string) => {
    const updated = toggleFavoriteResearch(id);
    setResearch(updated);
  };

  // Slide Deck handlers
  const handleSaveSlideDeck = (record: SlideDeckRecord) => {
    const updated = saveSlideDeckRecord(record);
    setSlides(updated);
  };

  const handleDeleteSlideDeck = (id: string) => {
    const updated = deleteSlideDeckRecord(id);
    setSlides(updated);
  };

  const handleToggleFavoriteSlideDeck = (id: string) => {
    const updated = toggleFavoriteSlideDeck(id);
    setSlides(updated);
  };

  // Dynamic productivity metrics
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const hoursSaved = Number(
    (
      (emails.length * 15 +
        meetings.length * 35 +
        completedTasksCount * 10 +
        tasks.length * 5 +
        research.length * 45 +
        slides.length * 40) /
      60
    ).toFixed(1)
  );

  const stats = {
    emailsDrafted: emails.length,
    meetingsSummarized: meetings.length,
    tasksCompleted: completedTasksCount,
    totalTasksPlanned: tasks.length,
    researchReports: research.length,
    slideDecksCreated: slides.length,
    estimatedHoursSaved: hoursSaved,
  };

  return (
    <div id="app-root" className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hoursSaved={hoursSaved}
        tasksCompleted={completedTasksCount}
        totalTasks={tasks.length}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Workspace Header */}
        <Header
          activeTab={activeTab}
          onOpenCommandPalette={() => setIsQuickAssistOpen(true)}
          onQuickAction={(tab) => setActiveTab(tab)}
          hoursSaved={hoursSaved}
        />

        {/* Dynamic Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              recentEmails={emails}
              recentMeetings={meetings}
              recentResearch={research}
              onNavigate={setActiveTab}
              onOpenQuickAssist={() => setIsQuickAssistOpen(true)}
            />
          )}

          {activeTab === 'email' && (
            <EmailGeneratorView
              onSaveEmail={handleSaveEmail}
              savedEmails={emails}
            />
          )}

          {activeTab === 'meeting' && (
            <MeetingSummarizerView
              onSaveMeeting={handleSaveMeeting}
              onAddTasksToPlanner={handleAddTasksFromMeeting}
              savedMeetings={meetings}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskPlannerView
              tasks={tasks}
              onUpdateTasks={handleUpdateTasks}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === 'research' && (
            <ResearchAssistantView
              onSaveResearch={handleSaveResearch}
              savedResearch={research}
            />
          )}

          {activeTab === 'slides' && (
            <SlideGeneratorView
              onSaveSlideDeck={handleSaveSlideDeck}
              savedSlideDecks={slides}
              initialDeck={selectedSlideDeck}
              onClearInitialDeck={() => setSelectedSlideDeck(null)}
            />
          )}

          {activeTab === 'history' && (
            <WorkspaceHistoryView
              savedEmails={emails}
              savedMeetings={meetings}
              savedResearch={research}
              savedSlides={slides}
              onDeleteEmail={handleDeleteEmail}
              onDeleteMeeting={handleDeleteMeeting}
              onDeleteResearch={handleDeleteResearch}
              onDeleteSlides={handleDeleteSlideDeck}
              onToggleFavoriteEmail={handleToggleFavoriteEmail}
              onToggleFavoriteMeeting={handleToggleFavoriteMeeting}
              onToggleFavoriteResearch={handleToggleFavoriteResearch}
              onToggleFavoriteSlides={handleToggleFavoriteSlideDeck}
              onNavigate={setActiveTab}
              onSelectSlideDeck={(deck) => {
                setSelectedSlideDeck(deck);
                setActiveTab('slides');
              }}
            />
          )}
        </main>
      </div>

      {/* Quick Assist / Command Palette Modal */}
      <QuickAssistModal
        isOpen={isQuickAssistOpen}
        onClose={() => setIsQuickAssistOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
