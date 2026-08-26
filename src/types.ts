export type NavigationTab = 
  | 'dashboard'
  | 'email'
  | 'meeting'
  | 'tasks'
  | 'research'
  | 'slides'
  | 'history'
  | 'analytics';

export type EmailTone = 
  | 'Executive & Concise'
  | 'Warm & Professional'
  | 'Diplomatic & Assertive'
  | 'Urgent & Direct'
  | 'Persuasive & Pitch'
  | 'Friendly & Casual';

export type EmailAudience = 
  | 'Executive / C-Suite'
  | 'Client / Customer'
  | 'Team / Direct Report'
  | 'Cross-functional Partner'
  | 'Vendor / Supplier'
  | 'External Candidate / Recruiter';

export type EmailLength = 
  | 'Concise (Bullets & TL;DR)'
  | 'Standard (2-3 Paragraphs)'
  | 'Comprehensive (Detailed)';

export interface EmailResult {
  subjectOptions: string[];
  primaryDraft: string;
  alternativeDraft: string;
  summaryBullet: string;
  isFallback?: boolean;
}

export interface EmailRecord {
  id: string;
  timestamp: string;
  purpose: string;
  audience: string;
  tone: string;
  result: EmailResult;
  isFavorite?: boolean;
}

export type MeetingType = 
  | 'Weekly Team Sync'
  | '1-on-1 Check-in'
  | 'Executive Strategy'
  | 'Sprint Retrospective'
  | 'Client Kickoff / Demo'
  | 'Project Postmortem'
  | 'Brainstorming Session';

export interface MeetingActionItem {
  id?: string;
  task: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  status: 'Pending' | 'Completed' | 'In Progress';
}

export interface MeetingResult {
  executiveSummary: string;
  keyDiscussionPoints: string[];
  actionItems: MeetingActionItem[];
  decisionsMade: string[];
  openQuestions: string[];
  suggestedNextAgenda: string[];
  isFallback?: boolean;
}

export interface MeetingRecord {
  id: string;
  timestamp: string;
  title: string;
  meetingType: MeetingType;
  date: string;
  attendees: string;
  rawNotes: string;
  result: MeetingResult;
  isFavorite?: boolean;
}

export type EisenhowerQuadrant = 
  | 'Do First (Urgent & Important)'
  | 'Schedule (Important, Not Urgent)'
  | 'Delegate / Automate (Urgent, Not Important)'
  | 'Eliminate / Backlog (Neither)';

export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type TaskEnergy = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Deep Work' | 'Communication' | 'Admin' | 'Strategy' | 'Meeting';

export interface PlannedTask {
  id: string;
  title: string;
  description?: string;
  eisenhowerQuadrant: EisenhowerQuadrant;
  priorityScore: TaskPriority;
  estimatedMinutes: number;
  energyRequired: TaskEnergy;
  category: TaskCategory;
  recommendedTime?: string;
  completed: boolean;
}

export interface TimeBlock {
  time: string;
  activity: string;
  type: 'focus' | 'break' | 'comms' | 'work' | 'admin';
}

export interface TaskPlanResult {
  productivityInsights: string;
  tasks: PlannedTask[];
  timeBlocks: TimeBlock[];
  isFallback?: boolean;
}

export interface TaskPlanRecord {
  id: string;
  timestamp: string;
  goal: string;
  workingHours: string;
  result: TaskPlanResult;
  isFavorite?: boolean;
}

export interface ResearchFinding {
  statOrFact: string;
  detail: string;
}

export interface ResearchResult {
  title: string;
  executiveSummary: string;
  keyFindings: ResearchFinding[];
  marketTrends: string[];
  swotOrProsCons: {
    strengths: string[];
    challenges: string[];
    opportunities: string[];
  };
  actionableRecommendations: string[];
  suggestedFollowUpTopics: string[];
  isFallback?: boolean;
}

export interface ResearchRecord {
  id: string;
  timestamp: string;
  topic: string;
  depth: string;
  industry?: string;
  result: ResearchResult;
  isFavorite?: boolean;
}

// Slide Deck & PowerPoint Generator Types
export type SlideTheme = 'indigo' | 'slate' | 'emerald' | 'midnight' | 'sunset';

export type SlideLayout = 
  | 'title' 
  | 'bullets' 
  | 'split' 
  | 'metrics' 
  | 'cards' 
  | 'timeline' 
  | 'summary';

export interface SlideMetric {
  label: string;
  value: string;
  change?: string;
}

export interface SlideCard {
  title: string;
  description: string;
  tag?: string;
}

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  layout: SlideLayout;
  bullets?: string[];
  leftContent?: string[];
  rightContent?: string[];
  metrics?: SlideMetric[];
  cards?: SlideCard[];
  takeaway?: string;
  speakerNotes?: string;
}

export interface SlideDeckResult {
  title: string;
  subtitle: string;
  targetAudience: string;
  theme: SlideTheme;
  totalSlides: number;
  slides: SlideItem[];
  isFallback?: boolean;
}

export interface SlideDeckRecord {
  id: string;
  timestamp: string;
  title: string;
  topic: string;
  theme: SlideTheme;
  slideCount: number;
  result: SlideDeckResult;
  isFavorite?: boolean;
}

export interface ProductivityStats {
  emailsDrafted: number;
  meetingsSummarized: number;
  tasksCompleted: number;
  totalTasksPlanned: number;
  researchReports: number;
  presentationsCreated?: number;
  estimatedHoursSaved: number;
}
