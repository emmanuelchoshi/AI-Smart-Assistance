import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get GoogleGenAI client
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check
app.get("/api/health", (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({ status: "ok", hasApiKey: hasKey });
});

// 1. Smart Email Generator Endpoint
app.post("/api/ai/email", async (req, res) => {
  try {
    const {
      purpose,
      audience,
      tone,
      length,
      keyPoints,
      threadContext,
      senderName,
      recipientName,
      includeCta,
      customInstructions,
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // High quality fallback generation if API key is not yet configured
      return res.json({
        success: true,
        isFallback: true,
        subjectOptions: [
          `Update on ${purpose || "Project Milestone"} - Next Steps`,
          `Quick sync: ${purpose || "Key Priorities"} for this week`,
          `Action Required: ${purpose || "Project Deliverables"} overview`,
        ],
        primaryDraft: `Hi ${recipientName || "there"},\n\nI hope you're having a productive week.\n\nI wanted to share a brief update regarding ${purpose || "our current initiatives"}.\n\nKey Highlights:\n${keyPoints ? keyPoints.split("\n").map((p: string) => `• ${p.trim()}`).join("\n") : "• Key milestones are progressing according to plan\n• Deliverables are on track for upcoming review"}\n\n${includeCta ? "Could you please review the attached summary and confirm if this aligns with your expectations by end of week?" : "Please let me know if you have any questions or feedback."}\n\nBest regards,\n${senderName || "Your Name"}`,
        alternativeDraft: `Dear ${recipientName || "Team"},\n\nRegarding ${purpose || "our ongoing objectives"}, here is a consolidated overview:\n\n${keyPoints || "All workstreams remain on schedule with priority items being actively addressed."}\n\nNext Step: ${includeCta ? "Please provide your sign-off by Friday afternoon." : "I will keep you posted on further developments."}\n\nSincerely,\n${senderName || "Your Name"}`,
        summaryBullet: `Overview of ${purpose || "project update"} covering key progress points and clear next steps.`,
      });
    }

    const prompt = `You are an elite workplace executive communication assistant. Generate a highly polished professional email based on the following specifications:
- Purpose / Topic: ${purpose || "General workplace update"}
- Recipient / Audience: ${audience || "Colleague / Stakeholder"}
- Target Tone: ${tone || "Professional and concise"}
- Desired Length: ${length || "Standard (2-3 paragraphs)"}
- Key Points / Content to include:
${keyPoints || "No specific points provided; write a standard professional update."}
${threadContext ? `- Existing Thread Context / Reply Context:\n${threadContext}` : ""}
${senderName ? `- Sender Name: ${senderName}` : ""}
${recipientName ? `- Recipient Name: ${recipientName}` : ""}
${includeCta ? "- Include a clear, respectful Call to Action." : ""}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ""}

Return your response strictly in the following JSON format:
{
  "subjectOptions": ["3 compelling, context-appropriate subject line choices"],
  "primaryDraft": "The full polished email text ready to send, including greeting, well-formatted body, and professional sign-off",
  "alternativeDraft": "An alternate version with slightly different phrasing or pacing",
  "summaryBullet": "A 1-sentence quick TL;DR of the email for quick scanning"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, isFallback: false, ...parsed });
  } catch (error: any) {
    console.error("Email generation error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate email",
    });
  }
});

// 2. Meeting Notes Summarizer Endpoint
app.post("/api/ai/meeting", async (req, res) => {
  try {
    const { title, meetingType, date, attendees, rawNotes, focusArea } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // High quality fallback
      return res.json({
        success: true,
        isFallback: true,
        executiveSummary: `The ${title || "team"} meeting focused on key project deliverables, resource alignment, and upcoming sprint timelines. Clear responsibilities were assigned to ensure milestones are met on schedule.`,
        keyDiscussionPoints: [
          "Reviewed sprint progress and identified primary bottleneck areas.",
          "Agreed on revised deliverables schedule for the upcoming release cycle.",
          "Aligned cross-functional teams on resource allocation and testing protocols.",
        ],
        actionItems: [
          {
            task: "Finalize technical specification and share with stakeholders",
            assignee: attendees ? attendees.split(",")[0]?.trim() || "Lead" : "Engineering Lead",
            priority: "High",
            deadline: "By end of week",
            status: "Pending",
          },
          {
            task: "Schedule design review follow-up meeting with product team",
            assignee: "Project Coordinator",
            priority: "Medium",
            deadline: "Next Tuesday",
            status: "Pending",
          },
          {
            task: "Update workspace documentation and project roadmap",
            assignee: "Documentation Specialist",
            priority: "Low",
            deadline: "Next sprint kickoff",
            status: "Pending",
          },
        ],
        decisionsMade: [
          "Approved the updated timeline for milestone 2 delivery.",
          "Decided to hold weekly 15-minute async check-ins.",
        ],
        openQuestions: [
          "Need confirmation on third-party vendor integration budget.",
          "Confirm availability of QA team for pre-launch smoke test.",
        ],
        suggestedNextAgenda: [
          "Review resolved action items from today's sync",
          "Demo milestone 2 progress",
          "Risk assessment for release window",
        ],
      });
    }

    const prompt = `You are an expert executive meeting analyst. Analyze the following meeting notes and extract structured, actionable workplace intelligence:
- Meeting Title: ${title || "Team Sync"}
- Meeting Type: ${meetingType || "General Work Session"}
- Date: ${date || "Recent"}
- Attendees: ${attendees || "Not specified"}
${focusArea ? `- Special Focus Area: ${focusArea}` : ""}

RAW NOTES / TRANSCRIPT:
"""
${rawNotes || "General discussion on roadmap and action items."}
"""

Return a comprehensive, highly organized analysis strictly in the following JSON format:
{
  "executiveSummary": "A punchy, 2-3 sentence high-level summary of what took place and primary outcomes",
  "keyDiscussionPoints": ["List of 3 to 6 major topics discussed with key context"],
  "actionItems": [
    {
      "task": "Specific actionable task description",
      "assignee": "Name of person responsible (or Team/Unassigned if not specified in notes)",
      "priority": "High | Medium | Low",
      "deadline": "Clear timeframe or explicit date if mentioned, otherwise reasonable estimate",
      "status": "Pending"
    }
  ],
  "decisionsMade": ["Clear list of concrete decisions reached during the meeting"],
  "openQuestions": ["Unresolved questions, blockers, or items requiring follow-up"],
  "suggestedNextAgenda": ["2 to 4 recommended topics for the next meeting"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, isFallback: false, ...parsed });
  } catch (error: any) {
    console.error("Meeting summarizer error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to summarize meeting notes",
    });
  }
});

// 3. AI Task Planner & Prioritizer Endpoint
app.post("/api/ai/task-plan", async (req, res) => {
  try {
    const { rawTasks, workingHours, currentEnergy, goal, includeTimeBlocks } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // High quality fallback
      return res.json({
        success: true,
        isFallback: true,
        productivityInsights: "Optimized your schedule by placing high-cognitive tasks in peak morning focus blocks and clustering administrative tasks in the afternoon.",
        tasks: [
          {
            id: "task-1",
            title: "High Priority Deliverable Focus",
            description: "Deep work session on primary core output",
            eisenhowerQuadrant: "Do First (Urgent & Important)",
            priorityScore: "P1",
            estimatedMinutes: 90,
            energyRequired: "High",
            category: "Deep Work",
            recommendedTime: "09:00 - 10:30",
            completed: false,
          },
          {
            id: "task-2",
            title: "Stakeholder Communications & Follow-ups",
            description: "Respond to critical emails and unblock colleagues",
            eisenhowerQuadrant: "Schedule (Important, Not Urgent)",
            priorityScore: "P2",
            estimatedMinutes: 45,
            energyRequired: "Medium",
            category: "Communication",
            recommendedTime: "11:00 - 11:45",
            completed: false,
          },
          {
            id: "task-3",
            title: "Review Metrics and Documentation",
            description: "Check sprint progress and verify tickets",
            eisenhowerQuadrant: "Delegate / Automate (Urgent, Not Important)",
            priorityScore: "P3",
            estimatedMinutes: 30,
            energyRequired: "Low",
            category: "Admin",
            recommendedTime: "14:00 - 14:30",
            completed: false,
          },
        ],
        timeBlocks: [
          { time: "09:00 - 10:30", activity: "Deep Work: Core Priority Task", type: "focus" },
          { time: "10:30 - 10:45", activity: "Rest & Hydration Break", type: "break" },
          { time: "10:45 - 12:00", activity: "Collaborative Sync & Comms", type: "comms" },
          { time: "12:00 - 13:00", activity: "Lunch & Recharge", type: "break" },
          { time: "13:00 - 15:00", activity: "Secondary Sprint Tasks & Reviews", type: "work" },
          { time: "15:00 - 15:30", activity: "Admin, Inbox Zero & Wrap-up", type: "admin" },
        ],
      });
    }

    const prompt = `You are a master productivity and executive time-management strategist. 
Analyze the user's disorganized tasks or to-do list, apply the Eisenhower Matrix (Urgent vs Important), estimate realistic durations, assign energy requirements, and construct an optimized daily flow.

User Input Tasks / Goals:
"""
${rawTasks || "Complete quarterly presentation, answer 15 emails, review team pull request, plan sprint backlog, follow up with vendor."}
"""

Context:
- Working Hours Window: ${workingHours || "9:00 AM - 5:00 PM"}
- Current Energy Level: ${currentEnergy || "High focus morning, medium afternoon"}
${goal ? `- Primary Daily Goal: ${goal}` : ""}

Return strictly in the following JSON format:
{
  "productivityInsights": "2-3 sentences explaining the strategy used to sequence these tasks for maximum cognitive flow and minimal fatigue",
  "tasks": [
    {
      "id": "unique string id like task-1",
      "title": "Clear action-oriented task title",
      "description": "Short explanation or sub-bullets",
      "eisenhowerQuadrant": "Do First (Urgent & Important) | Schedule (Important, Not Urgent) | Delegate / Automate (Urgent, Not Important) | Eliminate / Backlog (Neither)",
      "priorityScore": "P1 | P2 | P3 | P4",
      "estimatedMinutes": 45,
      "energyRequired": "High | Medium | Low",
      "category": "Deep Work | Communication | Admin | Strategy | Meeting",
      "recommendedTime": "e.g. 09:30 - 10:15",
      "completed": false
    }
  ],
  "timeBlocks": [
    {
      "time": "e.g. 09:00 - 10:30",
      "activity": "Description of activity or task block",
      "type": "focus | break | comms | work | admin"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, isFallback: false, ...parsed });
  } catch (error: any) {
    console.error("Task planning error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate task plan",
    });
  }
});

// 4. AI Research Assistant Endpoint
app.post("/api/ai/research", async (req, res) => {
  try {
    const { topic, depth, industry, targetAudience, specificQuestions } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // High quality fallback
      return res.json({
        success: true,
        isFallback: true,
        title: `Executive Research Brief: ${topic || "Workplace AI Trends"}`,
        executiveSummary: `This workplace intelligence brief synthesizes current market trends, operational best practices, and strategic opportunities regarding ${topic || "modern workplace productivity"}. Organizations adopting targeted automation report up to 35% time savings across routine communication and task coordination workflows.`,
        keyFindings: [
          {
            statOrFact: "35% efficiency boost",
            detail: "Knowledge workers save an average of 4-6 hours per week when automating drafts and meeting synthesis.",
          },
          {
            statOrFact: "Context Switching Reduction",
            detail: "Consolidating planning and summarization tools cuts cognitive overload and accelerates decision velocity.",
          },
          {
            statOrFact: "Structured Action Tracking",
            detail: "Teams tracking meeting commitments in structured action logs experience a 40% higher completion rate.",
          },
        ],
        marketTrends: [
          "Shift toward lightweight, task-specific AI copilot interfaces over generic chat windows.",
          "Emphasis on verifiable action items with explicit deadlines and owners.",
          "Integration of asynchronous audio/transcript summarization into daily sprint planning.",
        ],
        swotOrProsCons: {
          strengths: ["Immediate time-to-value for routine drafting", "Standardized documentation consistency"],
          challenges: ["Requires clear prompts to maintain nuanced brand voice", "Need human review for sensitive communications"],
          opportunities: ["Reinvest saved hours into strategic client relationships", "Accelerate team onboarding with automated knowledge capture"],
        },
        actionableRecommendations: [
          "Establish team prompt templates for recurring meeting types (1-on-1s, postmortems).",
          "Institute a daily 10-minute time-block review to align calendar with top Eisenhower P1 items.",
          "Standardize email generation guidelines for external client communications.",
        ],
        suggestedFollowUpTopics: [
          "Best practices for measuring workplace AI ROI",
          "Automating weekly executive status rollups",
          "Time-blocking frameworks for asynchronous remote teams",
        ],
      });
    }

    const prompt = `You are a Senior Strategic Research Analyst and workplace intelligence consultant. 
Conduct a thorough, high-value professional research brief on the following topic:

Topic / Query: ${topic || "Enterprise AI Adoption in 2026"}
Depth Level: ${depth || "In-Depth Strategic Analysis"}
${industry ? `Industry Context: ${industry}` : ""}
${targetAudience ? `Target Executive Audience: ${targetAudience}` : ""}
${specificQuestions ? `Specific Questions to Address:\n${specificQuestions}` : ""}

Provide authoritative, data-grounded insights formatted strictly as JSON:
{
  "title": "Crisp, professional report title",
  "executiveSummary": "A clear, comprehensive executive summary (2-3 paragraphs)",
  "keyFindings": [
    {
      "statOrFact": "Key metric, benchmark, or core finding headline",
      "detail": "Detailed explanation and workplace implications"
    }
  ],
  "marketTrends": ["3 to 5 notable developments, market shifts, or emerging paradigms"],
  "swotOrProsCons": {
    "strengths": ["Key strategic advantages or proven benefits"],
    "challenges": ["Key risks, adoption barriers, or limitations to monitor"],
    "opportunities": ["Actionable upside and competitive differentiators"]
  },
  "actionableRecommendations": ["3 to 5 concrete, step-by-step strategic recommendations for leaders/teams"],
  "suggestedFollowUpTopics": ["3 related high-value research directions"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, isFallback: false, ...parsed });
  } catch (error: any) {
    console.error("Research assistant error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate research report",
    });
  }
});

// 5. Quick Workplace Copilot Helper (Inline assistant / rewriter / simplifier)
app.post("/api/ai/quick-assist", async (req, res) => {
  try {
    const { action, text, context } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        result: action === "shorten" 
          ? text.split(".").slice(0, 2).join(".") + "."
          : `Polished version: ${text}`,
      });
    }

    let instruction = "Improve and polish this workplace text for maximum professional clarity and impact.";
    if (action === "shorten") {
      instruction = "Make this text 50% more concise while keeping all crucial facts and respectful tone.";
    } else if (action === "formalize") {
      instruction = "Elevate this text to an executive, polished, and diplomat tone suitable for C-suite or enterprise clients.";
    } else if (action === "bulletize") {
      instruction = "Convert this text into clean, scannable bullet points with bold lead-ins.";
    } else if (action === "action_items") {
      instruction = "Extract every single commitment and action item into a checklist format.";
    }

    const prompt = `${instruction}
${context ? `Context: ${context}` : ""}

Original Text:
"""
${text}
"""

Return only the improved text with no meta preamble.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({ success: true, isFallback: false, result: response.text?.trim() });
  } catch (error: any) {
    console.error("Quick assist error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to process quick assist",
    });
  }
});

// 6. PowerPoint Slide Deck Generator Endpoint
app.post("/api/ai/slides", async (req, res) => {
  try {
    const {
      topic,
      sourceContext,
      slideCount = 5,
      targetAudience = "Executive Stakeholders",
      theme = "indigo",
      includeSpeakerNotes = true,
      customInstructions,
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // High-quality fallback slide deck when API key is not yet set
      const safeTitle = topic || "AI Workplace Productivity Assistant";
      return res.json({
        success: true,
        isFallback: true,
        title: safeTitle,
        subtitle: "Executive Overview & Strategic Workplace Automation",
        targetAudience,
        theme,
        totalSlides: 5,
        slides: [
          {
            id: "slide-1",
            slideNumber: 1,
            title: safeTitle,
            subtitle: "Automating Daily Tasks & Unlocking High-Value Workflows",
            layout: "title",
            takeaway: "Empowering modern knowledge teams with contextual generative intelligence.",
            speakerNotes: "Welcome everyone. Today we are exploring how intelligent workplace automation drastically reduces cognitive overhead and accelerates core deliverables.",
          },
          {
            id: "slide-2",
            slideNumber: 2,
            title: "Core Capabilities & Architecture",
            subtitle: "Purpose-Built Workplace Copilots",
            layout: "cards",
            cards: [
              {
                title: "Smart Email Generator",
                description: "Audience-tailored drafts, tone calibration, and instant executive summaries.",
                tag: "Communication",
              },
              {
                title: "Meeting Notes Summarizer",
                description: "Automated extraction of action items, deadlines, owners, and decisions.",
                tag: "Synthesis",
              },
              {
                title: "AI Task Planner & Matrix",
                description: "Eisenhower quadrant prioritization with dynamic time-blocking schedules.",
                tag: "Execution",
              },
              {
                title: "Research & Slide Generator",
                description: "Deep market synthesis with instant export to Microsoft PowerPoint (.pptx).",
                tag: "Strategy",
              },
            ],
            takeaway: "Four specialized engines unified under a single responsive dashboard.",
            speakerNotes: "Notice how each module targets a distinct friction point in daily knowledge work: from drafting emails to structuring messy meeting notes into accountable action items.",
          },
          {
            id: "slide-3",
            slideNumber: 3,
            title: "Measurable Impact & Efficiency Gains",
            subtitle: "Operational Benchmarks & Time Savings",
            layout: "metrics",
            metrics: [
              { label: "Hours Saved / Week", value: "4.5 hrs", change: "+35% bandwidth" },
              { label: "Action Item Completion", value: "94%", change: "+28% vs manual" },
              { label: "Drafting Speed", value: "3.2x", change: "Instant iterations" },
              { label: "Context Switching", value: "-45%", change: "Unified workspace" },
            ],
            takeaway: "Drastically cuts administrative drag so teams focus on high-leverage strategic work.",
            speakerNotes: "Here are the core productivity metrics. By consolidating communications and task planning, teams recover almost an entire workday every two weeks.",
          },
          {
            id: "slide-4",
            slideNumber: 4,
            title: "Implementation Strategy vs Traditional Workflow",
            subtitle: "Side-by-Side Workflow Transformation",
            layout: "split",
            leftContent: [
              "Fragmented notes scattered across docs",
              "Unclear owners and missed task deadlines",
              "Time-consuming email drafting cycles",
              "Siloed research and repetitive manual synthesis",
            ],
            rightContent: [
              "Structured AI meeting summaries with instant owner tags",
              "Automated Eisenhower Matrix & calendar time-blocks",
              "Contextual one-click tone & audience adaptation",
              "Instant PowerPoint slide deck and brief generation",
            ],
            takeaway: "A shift from reactive administrative fire-fighting to proactive strategic momentum.",
            speakerNotes: "On the left is the manual status quo. On the right is the streamlined AI assistant workflow that unifies actions, dates, and drafts.",
          },
          {
            id: "slide-5",
            slideNumber: 5,
            title: "Next Steps & Roadmap Rollout",
            subtitle: "Action Plan for Enterprise Deployment",
            layout: "timeline",
            cards: [
              {
                title: "Phase 1: Team Pilot (Weeks 1-2)",
                description: "Onboard core product and operations teams with customized prompt templates.",
                tag: "Pilot",
              },
              {
                title: "Phase 2: Workflow Integration (Weeks 3-4)",
                description: "Connect meeting calendar streams and automated weekly status slide export.",
                tag: "Integration",
              },
              {
                title: "Phase 3: Scale & Optimization (Month 2+)",
                description: "Establish company-wide productivity benchmarks and advanced analytics.",
                tag: "Scale",
              },
            ],
            takeaway: "Immediate time-to-value with lightweight rollout and no extensive training required.",
            speakerNotes: "To conclude, the roadmap begins with a focused pilot to measure time savings, followed by direct calendar integration and enterprise-wide adoption.",
          },
        ],
      });
    }

    const prompt = `You are a master presentation designer and executive speechwriter. Create a professional, highly structured PowerPoint slide deck presentation based on the following topic and source intelligence.

Topic / Presentation Title: ${topic || "AI Workplace Productivity Assistant"}
Target Audience: ${targetAudience}
Requested Slide Count: ${slideCount} slides
Visual Theme: ${theme}
${sourceContext ? `Source Context & Notes from Chat / Workspace:\n"""\n${sourceContext}\n"""` : ""}
${customInstructions ? `Special Guidance: ${customInstructions}` : ""}

SLIDE DESIGN PRINCIPLES:
1. Every slide must have a crisp, high-impact Title and clarifying Subtitle.
2. Choose the best layout for each slide from:
   - 'title' (Opening slide)
   - 'bullets' (Clean list with bold leads)
   - 'split' (2-column comparison, Left vs Right, or Challenge vs Solution)
   - 'metrics' (3-4 big numbers/stats with labels and percentage changes)
   - 'cards' (3-4 distinct structured feature cards or pillars)
   - 'timeline' (Sequential phases, roadmap, or milestones)
   - 'summary' (Executive takeaways and concluding recommendations)
3. Include an insightful 'takeaway' (1 punchy bottom-line summary sentence).
4. Include detailed 'speakerNotes' for the presenter (2-3 sentences explaining talking points).

Return strictly in valid JSON format:
{
  "title": "Presentation Main Title",
  "subtitle": "Clear presentation subtitle",
  "targetAudience": "${targetAudience}",
  "theme": "${theme}",
  "totalSlides": ${slideCount},
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "title": "Slide Headline",
      "subtitle": "Supporting context",
      "layout": "title | bullets | split | metrics | cards | timeline | summary",
      "bullets": ["Point 1 with bold lead-in", "Point 2", "Point 3"],
      "leftContent": ["Item 1", "Item 2"],
      "rightContent": ["Item 1", "Item 2"],
      "metrics": [
        { "label": "Key Metric Name", "value": "120%", "change": "+45% YoY" }
      ],
      "cards": [
        { "title": "Card Title", "description": "Crisp 1-2 sentence detail", "tag": "Category" }
      ],
      "takeaway": "The one key takeaway the audience must remember from this slide",
      "speakerNotes": "Guidance and script notes for the presenter when speaking on this slide"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, isFallback: false, ...parsed });
  } catch (error: any) {
    console.error("Slide deck generation error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate slide deck",
    });
  }
});

// Mount Vite middleware for development or static files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Workplace Productivity Assistant running on port ${PORT}`);
  });
}

startServer();
