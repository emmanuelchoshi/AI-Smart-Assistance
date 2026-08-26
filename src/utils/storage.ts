import {
  EmailRecord,
  MeetingRecord,
  TaskPlanRecord,
  ResearchRecord,
  SlideDeckRecord,
  ProductivityStats,
  PlannedTask,
} from '../types';

const EMAILS_KEY = 'ai_productivity_emails';
const MEETINGS_KEY = 'ai_productivity_meetings';
const TASKS_KEY = 'ai_productivity_tasks';
const RESEARCH_KEY = 'ai_productivity_research';
const SLIDES_KEY = 'ai_productivity_slides';
const ACTIVE_TASKS_KEY = 'ai_productivity_active_tasks';

export const INITIAL_ACTIVE_TASKS: PlannedTask[] = [
  {
    id: 'task-1',
    title: 'Finalize Q3 Budget Proposal & ROI Model',
    description: 'Synthesize department inputs into executive spreadsheet for CFO review.',
    eisenhowerQuadrant: 'Do First (Urgent & Important)',
    priorityScore: 'P1',
    estimatedMinutes: 90,
    energyRequired: 'High',
    category: 'Deep Work',
    recommendedTime: '09:00 - 10:30',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Review Sprint Deliverables & Unblock Frontend Team',
    description: 'Verify API contracts and approve pending pull requests.',
    eisenhowerQuadrant: 'Do First (Urgent & Important)',
    priorityScore: 'P1',
    estimatedMinutes: 45,
    energyRequired: 'High',
    category: 'Deep Work',
    recommendedTime: '10:45 - 11:30',
    completed: true,
  },
  {
    id: 'task-3',
    title: 'Prepare Slide Deck for Stakeholder Quarterly Review',
    description: 'Draft strategic milestones, key performance indicators, and hiring plan.',
    eisenhowerQuadrant: 'Schedule (Important, Not Urgent)',
    priorityScore: 'P2',
    estimatedMinutes: 60,
    energyRequired: 'Medium',
    category: 'Strategy',
    recommendedTime: '13:00 - 14:00',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Respond to Vendor Security Questionnaire',
    description: 'Fill in cloud compliance and access control verification details.',
    eisenhowerQuadrant: 'Delegate / Automate (Urgent, Not Important)',
    priorityScore: 'P3',
    estimatedMinutes: 30,
    energyRequired: 'Low',
    category: 'Admin',
    recommendedTime: '15:00 - 15:30',
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Organize Workspace Documentation & Archive Stale Tickets',
    description: 'Clean up backlog and update onboarding guide for new hires.',
    eisenhowerQuadrant: 'Eliminate / Backlog (Neither)',
    priorityScore: 'P4',
    estimatedMinutes: 25,
    energyRequired: 'Low',
    category: 'Admin',
    recommendedTime: '16:30 - 17:00',
    completed: false,
  },
];

export const INITIAL_SAVED_EMAILS: EmailRecord[] = [
  {
    id: 'email-demo-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    purpose: 'Project Alpha Timeline Adjustment & Scope Reallocation',
    audience: 'Executive / C-Suite',
    tone: 'Executive & Concise',
    isFavorite: true,
    result: {
      subjectOptions: [
        'Project Alpha: Scope Optimization & Revised Q3 Delivery Window',
        'Executive Update: Project Alpha Schedule & Resource Alignment',
        'Decision Required: Alpha Milestone Reallocation for On-Time Delivery',
      ],
      primaryDraft: `Hi Leadership Team,\n\nI am writing to provide a concise status update on Project Alpha. Following our mid-quarter review, the core engineering milestones are progressing smoothly, and we have achieved 85% of our foundational platform objectives.\n\nKey Strategic Adjustments:\n• Critical Path: Core data pipeline is on track for September 15 launch.\n• Scope Refinement: Non-blocking reporting widgets will transition to Milestone 2.\n• Resource Reallocation: 2 senior engineers are pairing on end-to-end load testing.\n\nNext Steps:\nWe invite your feedback by Thursday 5:00 PM before we lock down release staging.\n\nBest regards,\nAlex Chen | Staff Technical Lead`,
      alternativeDraft: `Executive Summary: Project Alpha Timeline & Scope Optimization\n\nAll critical tier-1 deliverables for Project Alpha remain on schedule. To ensure 99.9% release stability, we are deferring secondary analytics modules to Phase 2, protecting the September 15 target.\n\nPlease review the attached architecture review by Thursday.\n\nRegards,\nAlex Chen`,
      summaryBullet: 'Strategic scope refinement on Project Alpha preserving core September 15 release.',
    },
  },
];

export const INITIAL_SAVED_MEETINGS: MeetingRecord[] = [
  {
    id: 'meeting-demo-1',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    title: 'Product Roadmap & Engineering Sprint Kickoff',
    meetingType: 'Weekly Team Sync',
    date: 'Today',
    attendees: 'Alex (Lead), Sarah (PM), David (Backend), Elena (Design)',
    rawNotes: 'Sprint 24 kickoff. Sarah presented user feedback on checkout flow. Dropoff rate at 12%. Elena redesigned 2-step checkout. David agreed API can support it with minor schema update. Need to test payment gateway edge cases by Friday. Alex to coordinate with QA. Decision: We will roll out A/B test to 10% users next Wednesday.',
    isFavorite: true,
    result: {
      executiveSummary: 'Sprint 24 kickoff focused on reducing checkout dropoff (12%) through Elena\'s redesigned 2-step flow. The team aligned on technical feasibility, target testing by Friday, and a 10% user A/B test launch next Wednesday.',
      keyDiscussionPoints: [
        'Analyzed checkout dropoff analytics (current baseline 12%).',
        'Reviewed and approved the 2-step streamlined checkout prototype.',
        'David verified backend API changes are lightweight with zero breaking schema impact.',
        'Risk mitigation planned for edge-case payment gateway declines.',
      ],
      actionItems: [
        {
          task: 'Implement backend API endpoints for 2-step checkout',
          assignee: 'David (Backend)',
          priority: 'High',
          deadline: 'This Thursday',
          status: 'In Progress',
        },
        {
          task: 'Coordinate end-to-end QA test suite & decline edge cases',
          assignee: 'Alex (Lead)',
          priority: 'High',
          deadline: 'Friday 4:00 PM',
          status: 'Pending',
        },
        {
          task: 'Configure A/B experiment flag for 10% rollout',
          assignee: 'Sarah (PM)',
          priority: 'Medium',
          deadline: 'Next Tuesday',
          status: 'Pending',
        },
      ],
      decisionsMade: [
        'Approved 2-step checkout design for immediate sprint implementation.',
        'Agreed on a 10% canary traffic rollout for the upcoming Wednesday.',
      ],
      openQuestions: [
        'Confirm whether Apple Pay tokenization requires separate mobile web SDK upgrade.',
      ],
      suggestedNextAgenda: [
        'Review QA test suite outcomes from payment gateway dry run',
        'Inspect 10% canary metric telemetry in real-time',
      ],
    },
  },
];

export const INITIAL_SAVED_RESEARCH: ResearchRecord[] = [
  {
    id: 'research-demo-1',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    topic: 'Modern AI Productivity Workflows & Enterprise Time Optimization',
    depth: 'In-Depth Strategic Analysis',
    industry: 'Enterprise Technology & Knowledge Work',
    isFavorite: true,
    result: {
      title: 'Executive Brief: The ROI of Structured Workplace AI Automation',
      executiveSummary: 'Modern enterprise knowledge workers spend an estimated 28% of their working week drafting routine emails, reconciling fragmented meeting notes, and manually triaging task backlogs. Context-aware AI workflows that combine task prioritization with automated documentation are delivering 5.2 hours of weekly reclaimed deep-work capacity per employee.',
      keyFindings: [
        {
          statOrFact: '5.2 Reclaimed Hours Weekly',
          detail: 'Automation of initial drafts and meeting synthesis reduces communication overhead by over 30%.',
        },
        {
          statOrFact: '84% Action Item Closure Rate',
          detail: 'Teams using structured action logs with automated ownership tracking close commitments 40% faster.',
        },
        {
          statOrFact: 'Eisenhower Time-Blocking Impact',
          detail: 'Allocating high-cognitive tasks to morning 90-minute blocks cuts task switching by 45%.',
        },
      ],
      marketTrends: [
        'Transition from open-ended generic chat bots to purpose-built, single-click task copilot cards.',
        'Direct interoperability between meeting transcripts and live actionable sprint backlogs.',
        'High-density, distraction-free SaaS dashboards that emphasize focus over decorative noise.',
      ],
      swotOrProsCons: {
        strengths: [
          'Immediate measurable lift in weekly productive output',
          'Elimination of stale meeting notes and lost action items',
          'Standardized executive communication tone across team tiers',
        ],
        challenges: [
          'Ensuring team members maintain habitual daily planning routines',
          'Reviewing high-stakes communications for delicate business nuances',
        ],
        opportunities: [
          'Reinvesting recovered hours into product innovation and high-touch customer relationships',
          'Automated daily executive status rollups across multi-disciplinary teams',
        ],
      },
      actionableRecommendations: [
        'Standardize on structured meeting templates (Executive Summary + Action Items + Decisions).',
        'Institute a daily 5-minute morning Eisenhower triage to guard deep-work focus blocks.',
        'Utilize multi-tone email generator presets to prevent decision fatigue on outreach.',
      ],
      suggestedFollowUpTopics: [
        'Async team culture best practices for remote organizations',
        'Measuring cognitive load reduction in sprint planning',
      ],
    },
  },
];

export function getSavedEmails(): EmailRecord[] {
  try {
    const raw = localStorage.getItem(EMAILS_KEY);
    if (!raw) {
      localStorage.setItem(EMAILS_KEY, JSON.stringify(INITIAL_SAVED_EMAILS));
      return INITIAL_SAVED_EMAILS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVED_EMAILS;
  }
}

export function saveEmailRecord(record: EmailRecord) {
  const list = getSavedEmails();
  const updated = [record, ...list.filter(item => item.id !== record.id)];
  localStorage.setItem(EMAILS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteEmailRecord(id: string) {
  const list = getSavedEmails();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(EMAILS_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleFavoriteEmail(id: string) {
  const list = getSavedEmails();
  const updated = list.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
  localStorage.setItem(EMAILS_KEY, JSON.stringify(updated));
  return updated;
}

export function getSavedMeetings(): MeetingRecord[] {
  try {
    const raw = localStorage.getItem(MEETINGS_KEY);
    if (!raw) {
      localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_SAVED_MEETINGS));
      return INITIAL_SAVED_MEETINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVED_MEETINGS;
  }
}

export function saveMeetingRecord(record: MeetingRecord) {
  const list = getSavedMeetings();
  const updated = [record, ...list.filter(item => item.id !== record.id)];
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteMeetingRecord(id: string) {
  const list = getSavedMeetings();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleFavoriteMeeting(id: string) {
  const list = getSavedMeetings();
  const updated = list.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function getActiveTasks(): PlannedTask[] {
  try {
    const raw = localStorage.getItem(ACTIVE_TASKS_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(INITIAL_ACTIVE_TASKS));
      return INITIAL_ACTIVE_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVE_TASKS;
  }
}

export function saveActiveTasks(tasks: PlannedTask[]) {
  localStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
}

export function getSavedResearch(): ResearchRecord[] {
  try {
    const raw = localStorage.getItem(RESEARCH_KEY);
    if (!raw) {
      localStorage.setItem(RESEARCH_KEY, JSON.stringify(INITIAL_SAVED_RESEARCH));
      return INITIAL_SAVED_RESEARCH;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVED_RESEARCH;
  }
}

export function saveResearchRecord(record: ResearchRecord) {
  const list = getSavedResearch();
  const updated = [record, ...list.filter(item => item.id !== record.id)];
  localStorage.setItem(RESEARCH_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteResearchRecord(id: string) {
  const list = getSavedResearch();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(RESEARCH_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleFavoriteResearch(id: string) {
  const list = getSavedResearch();
  const updated = list.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
  localStorage.setItem(RESEARCH_KEY, JSON.stringify(updated));
  return updated;
}

export const INITIAL_SAVED_SLIDES: SlideDeckRecord[] = [
  {
    id: 'slides-demo-1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    title: 'AI Workplace Productivity Assistant: Automated Daily Tasks & Executive Deck',
    topic: 'AI Workplace Productivity Assistant',
    theme: 'indigo',
    slideCount: 5,
    isFavorite: true,
    result: {
      title: 'AI Workplace Productivity Assistant',
      subtitle: 'Automating Daily Workplace Workflows with Contextual Generative Intelligence',
      targetAudience: 'Executive Leadership & Productivity Teams',
      theme: 'indigo',
      totalSlides: 5,
      slides: [
        {
          id: 'slide-1',
          slideNumber: 1,
          title: 'AI Workplace Productivity Assistant',
          subtitle: 'Automating Daily Workplace Tasks & Eliminating Cognitive Overhead',
          layout: 'title',
          takeaway: 'Empowering knowledge workers to focus on high-impact strategic execution.',
          speakerNotes: 'Welcome everyone. Today we are walking through the AI Workplace Productivity Assistant, an integrated copilot designed to eliminate daily administrative friction.',
        },
        {
          id: 'slide-2',
          slideNumber: 2,
          title: 'Four Core AI Productivity Engines',
          subtitle: 'Purpose-Built Modules for Daily Professional Workflow',
          layout: 'cards',
          cards: [
            {
              title: 'Smart Email Generator',
              description: 'Calibrated tone, audience context, and one-click executive variations.',
              tag: 'Communications',
            },
            {
              title: 'Meeting Notes Summarizer',
              description: 'Instant extraction of action items, deadlines, decisions, and next agendas.',
              tag: 'Synthesis',
            },
            {
              title: 'AI Task Planner',
              description: 'Eisenhower matrix prioritization combined with dynamic time-blocking.',
              tag: 'Scheduling',
            },
            {
              title: 'Research & Slide Deck',
              description: 'In-depth market synthesis and instant Microsoft PowerPoint (.pptx) file export.',
              tag: 'Presentation',
            },
          ],
          takeaway: 'A complete SaaS workflow replacing fragmented single-purpose tools.',
          speakerNotes: 'Each module directly addresses a core knowledge worker pain point: drafting communications, capturing meeting follow-ups, prioritizing daily sprints, and presenting findings.',
        },
        {
          id: 'slide-3',
          slideNumber: 3,
          title: 'Measurable Efficiency Gains & Impact',
          subtitle: 'Empirical Metrics Across Modern Knowledge Teams',
          layout: 'metrics',
          metrics: [
            { label: 'Weekly Hours Reclaimed', value: '4.5 hrs', change: '+35% deep work' },
            { label: 'Action Item Follow-through', value: '94%', change: '+28% closure rate' },
            { label: 'Draft Velocity', value: '3.5x', change: 'Instant review & send' },
            { label: 'Context Switching Drag', value: '-45%', change: 'Unified dashboard' },
          ],
          takeaway: 'Reinvesting reclaimed time directly into product innovation and high-touch strategy.',
          speakerNotes: 'The productivity numbers speak for themselves. Automated synthesis and task structuring recover an average of 4.5 hours per employee each week.',
        },
        {
          id: 'slide-4',
          slideNumber: 4,
          title: 'Manual Workflow vs. AI Productivity Assistant',
          subtitle: 'Comparative Operational Transformation',
          layout: 'split',
          leftContent: [
            'Fragmented notes lost in scattered docs and chat threads',
            'Unassigned commitments and missed deliverable deadlines',
            'Repetitive email drafting and decision fatigue',
            'Manual slide deck preparation taking hours per presentation',
          ],
          rightContent: [
            'Structured executive summaries with verified assignees & due dates',
            'Automated Eisenhower 4-quadrant prioritization and schedule blocks',
            'One-click tone and audience tailored drafts with instant subject options',
            'Instant PowerPoint .pptx deck export ready for leadership presentations',
          ],
          takeaway: 'Transforming unstructured workplace noise into actionable business momentum.',
          speakerNotes: 'Notice the contrast between the manual friction on the left and the structured, automated velocity enabled on the right.',
        },
        {
          id: 'slide-5',
          slideNumber: 5,
          title: 'Roadmap Rollout & Team Adoption',
          subtitle: 'Step-by-Step Implementation Framework',
          layout: 'timeline',
          cards: [
            {
              title: 'Phase 1: Team Pilot (Weeks 1-2)',
              description: 'Rollout to core product and operations teams with customized templates.',
              tag: 'Pilot',
            },
            {
              title: 'Phase 2: Calendar Integration (Weeks 3-4)',
              description: 'Connect meeting schedules and enable automated weekly status deck exports.',
              tag: 'Integration',
            },
            {
              title: 'Phase 3: Org-Wide Scale (Month 2+)',
              description: 'Deploy across all departments with central productivity benchmarks.',
              tag: 'Scale',
            },
          ],
          takeaway: 'Rapid time-to-value with lightweight adoption and immediate productivity lift.',
          speakerNotes: 'We recommend initiating a 2-week pilot with core product and engineering teams before rolling out department-wide.',
        },
      ],
    },
  },
];

export function getSavedSlideDecks(): SlideDeckRecord[] {
  try {
    const raw = localStorage.getItem(SLIDES_KEY);
    if (!raw) {
      localStorage.setItem(SLIDES_KEY, JSON.stringify(INITIAL_SAVED_SLIDES));
      return INITIAL_SAVED_SLIDES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVED_SLIDES;
  }
}

export function saveSlideDeckRecord(record: SlideDeckRecord) {
  const list = getSavedSlideDecks();
  const updated = [record, ...list.filter(item => item.id !== record.id)];
  localStorage.setItem(SLIDES_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteSlideDeckRecord(id: string) {
  const list = getSavedSlideDecks();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(SLIDES_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleFavoriteSlideDeck(id: string) {
  const list = getSavedSlideDecks();
  const updated = list.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
  localStorage.setItem(SLIDES_KEY, JSON.stringify(updated));
  return updated;
}

export function calculateProductivityStats(): ProductivityStats {
  const emails = getSavedEmails();
  const meetings = getSavedMeetings();
  const tasks = getActiveTasks();
  const research = getSavedResearch();
  const slides = getSavedSlideDecks();

  const completedTasks = tasks.filter(t => t.completed).length;
  
  // Estimate time saved: 
  // ~15 mins per email drafted with AI
  // ~35 mins per meeting summarized with structured action items
  // ~25 mins per task planning session
  // ~45 mins per research brief
  // ~60 mins per slide deck generated & formatted
  const hoursSaved = (
    (emails.length * 15) +
    (meetings.length * 35) +
    (completedTasks * 10) +
    (tasks.length * 5) +
    (research.length * 45) +
    (slides.length * 60)
  ) / 60;

  return {
    emailsDrafted: emails.length,
    meetingsSummarized: meetings.length,
    tasksCompleted: completedTasks,
    totalTasksPlanned: tasks.length,
    researchReports: research.length,
    presentationsCreated: slides.length,
    estimatedHoursSaved: Number(hoursSaved.toFixed(1)),
  };
}
