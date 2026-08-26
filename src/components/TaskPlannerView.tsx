import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Zap,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  Circle,
  TrendingUp,
  Sliders,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PlannedTask,
  TaskPlanResult,
  EisenhowerQuadrant,
  TaskPriority,
  TaskEnergy,
  TimeBlock,
} from '../types';

interface TaskPlannerViewProps {
  tasks: PlannedTask[];
  onUpdateTasks: (tasks: PlannedTask[]) => void;
  onToggleTask: (taskId: string) => void;
}

export const TaskPlannerView: React.FC<TaskPlannerViewProps> = ({
  tasks,
  onUpdateTasks,
  onToggleTask,
}) => {
  const [rawTasksInput, setRawTasksInput] = useState('');
  const [workingHours, setWorkingHours] = useState('9:00 AM - 5:00 PM');
  const [currentEnergy, setCurrentEnergy] = useState('High morning focus, medium afternoon');
  const [primaryGoal, setPrimaryGoal] = useState('Complete Q3 Budget Review & unblock team');
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<TaskPlanResult | null>(null);

  // View mode
  const [activeViewMode, setActiveViewMode] = useState<'matrix' | 'timeline' | 'list'>('matrix');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPriority, setCustomPriority] = useState<TaskPriority>('P1');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [customEnergy, setCustomEnergy] = useState<TaskEnergy>('High');

  const SAMPLE_TASKS_PROMPT = `1. Finalize Q3 analytics slides for executive review
2. Reply to 14 urgent client emails in inbox
3. Review David's backend PR on SSO validation
4. Update project roadmap in Jira
5. Prepare talking points for 1-on-1 with Sarah
6. Fix broken links on internal documentation wiki
7. Coordinate catering order for Friday team offsite`;

  const handleLoadSample = () => {
    setRawTasksInput(SAMPLE_TASKS_PROMPT);
    setPrimaryGoal('Ship executive presentation & maintain zero sprint blockers');
  };

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawTasksInput.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/ai/task-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawTasks: rawTasksInput,
          workingHours,
          currentEnergy,
          goal: primaryGoal,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPlanResult(data);
        if (data.tasks?.length) {
          // Merge or replace tasks
          onUpdateTasks(data.tasks);
        }
      }
    } catch (err) {
      console.error('Task planning failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCheck = (taskId: string) => {
    onToggleTask(taskId);
    // Check if newly completed
    const target = tasks.find((t) => t.id === taskId);
    if (target && !target.completed) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const quadrant: EisenhowerQuadrant =
      customPriority === 'P1'
        ? 'Do First (Urgent & Important)'
        : customPriority === 'P2'
        ? 'Schedule (Important, Not Urgent)'
        : customPriority === 'P3'
        ? 'Delegate / Automate (Urgent, Not Important)'
        : 'Eliminate / Backlog (Neither)';

    const newTask: PlannedTask = {
      id: `task-custom-${Date.now()}`,
      title: customTitle,
      eisenhowerQuadrant: quadrant,
      priorityScore: customPriority,
      estimatedMinutes: customMinutes,
      energyRequired: customEnergy,
      category: 'Deep Work',
      completed: false,
    };

    onUpdateTasks([newTask, ...tasks]);
    setCustomTitle('');
    setIsAddingCustom(false);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  const deepWorkMinutes = tasks
    .filter((t) => t.energyRequired === 'High')
    .reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

  // Group tasks by Eisenhower Quadrant
  const q1Tasks = tasks.filter(
    (t) => t.eisenhowerQuadrant === 'Do First (Urgent & Important)' || t.priorityScore === 'P1'
  );
  const q2Tasks = tasks.filter(
    (t) => t.eisenhowerQuadrant === 'Schedule (Important, Not Urgent)' || t.priorityScore === 'P2'
  );
  const q3Tasks = tasks.filter(
    (t) =>
      t.eisenhowerQuadrant === 'Delegate / Automate (Urgent, Not Important)' ||
      t.priorityScore === 'P3'
  );
  const q4Tasks = tasks.filter(
    (t) =>
      t.eisenhowerQuadrant === 'Eliminate / Backlog (Neither)' || t.priorityScore === 'P4'
  );

  return (
    <div id="task-planner-view" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & AI Intake Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              AI Intelligent Prioritization & Time-Blocking
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste disorganized thoughts, to-do lists, or slack messages to auto-sort into an Eisenhower Matrix with schedule slots.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg text-amber-800 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Load Sample To-Do List
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGeneratePlan} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <textarea
                value={rawTasksInput}
                onChange={(e) => setRawTasksInput(e.target.value)}
                rows={3}
                placeholder="Paste or type messy tasks (e.g., 1. Finish deck, 2. Email Sarah about budget, 3. Review PR #104)..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="Primary Daily Goal (Optional)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loading || !rawTasksInput.trim()}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-amber-600/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Prioritizing & Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Prioritize Tasks with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Productivity Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Completion Rate
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {completedCount} / {tasks.length}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Estimated Total Workload
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {(totalMinutes / 60).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-500">hours</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Deep Work Focus Time
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {(deepWorkMinutes / 60).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-500">hours</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Strategy Insights Callout if Available */}
      {planResult?.productivityInsights && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">AI Flow Strategy: </span>
            <span>{planResult.productivityInsights}</span>
          </div>
        </div>
      )}

      {/* Interactive Controls & View Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'matrix'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Eisenhower Matrix</span>
          </button>

          <button
            onClick={() => setActiveViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Time-Blocks</span>
          </button>

          <button
            onClick={() => setActiveViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task Master List</span>
          </button>
        </div>

        {/* Add Custom Task Trigger */}
        <button
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Add Task Popdown Form */}
      {isAddingCustom && (
        <form
          onSubmit={handleAddTask}
          className="p-4 rounded-xl bg-white border border-indigo-200 shadow-sm space-y-3 animate-in fade-in"
        >
          <div className="font-semibold text-xs text-slate-800">New Task Intake</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Task description..."
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <select
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value as TaskPriority)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="P1">P1 - Urgent & Critical</option>
                <option value="P2">P2 - Important Strategy</option>
                <option value="P3">P3 - Admin / Delegate</option>
                <option value="P4">P4 - Backlog</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                placeholder="Mins"
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 1: EISENHOWER 4-QUADRANT MATRIX */}
      {activeViewMode === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Q1: Do First */}
          <div className="bg-white rounded-2xl p-4 border-2 border-rose-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                  Q1: Do First (Urgent & Important)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                {q1Tasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {q1Tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-rose-50/30 border-rose-200 text-slate-800 hover:bg-rose-50/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskCheck(task.id)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{task.title}</div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-semibold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                        {task.estimatedMinutes} mins
                      </span>
                      <span>Energy: {task.energyRequired}</span>
                      {task.recommendedTime && <span>• {task.recommendedTime}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {q1Tasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No urgent/critical tasks. Focus on Schedule (Q2).
                </div>
              )}
            </div>
          </div>

          {/* Q2: Schedule */}
          <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                  Q2: Schedule (Important, Not Urgent)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                {q2Tasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {q2Tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-indigo-50/30 border-indigo-200 text-slate-800 hover:bg-indigo-50/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskCheck(task.id)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{task.title}</div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-semibold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                        {task.estimatedMinutes} mins
                      </span>
                      <span>Energy: {task.energyRequired}</span>
                      {task.recommendedTime && <span>• {task.recommendedTime}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {q2Tasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No strategic scheduled items currently listed.
                </div>
              )}
            </div>
          </div>

          {/* Q3: Delegate / Automate */}
          <div className="bg-white rounded-2xl p-4 border-2 border-amber-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                  Q3: Delegate / Automate (Urgent, Low Impact)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                {q3Tasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {q3Tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-amber-50/30 border-amber-200 text-slate-800 hover:bg-amber-50/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskCheck(task.id)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{task.title}</div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {task.estimatedMinutes} mins
                      </span>
                      <span>Admin Task</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {q3Tasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No tasks in delegate/automate queue.
                </div>
              )}
            </div>
          </div>

          {/* Q4: Eliminate / Backlog */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Q4: Eliminate / Backlog (Low Impact)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                {q4Tasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {q4Tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskCheck(task.id)}
                    className="mt-0.5 rounded text-slate-600 focus:ring-slate-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>{task.estimatedMinutes} mins</span>
                      <span>• Defer / Deprioritize</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {q4Tasks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Clean backlog! No low-impact clutter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TIME-BLOCKING TIMELINE */}
      {activeViewMode === 'timeline' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Optimized Daily Time-Block Schedule
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured to protect morning peak cognitive energy and bundle shallow admin.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(planResult?.timeBlocks || [
              { time: '09:00 - 10:30', activity: 'Deep Work Session (P1 Core Deliverable)', type: 'focus' },
              { time: '10:30 - 10:45', activity: 'Hydration & Cognitive Reset Break', type: 'break' },
              { time: '10:45 - 12:00', activity: 'Collaborative Syncs & Unblocking Team', type: 'comms' },
              { time: '12:00 - 13:00', activity: 'Lunch & Screen-Free Recharge', type: 'break' },
              { time: '13:00 - 15:00', activity: 'Secondary Strategic Execution (P2)', type: 'work' },
              { time: '15:00 - 15:30', activity: 'Inbox Zero & Admin Triage (P3)', type: 'admin' },
              { time: '15:30 - 17:00', activity: 'Review, Documentation & Tomorrow Prep', type: 'work' },
            ]).map((block, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  block.type === 'focus'
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-medium'
                    : block.type === 'break'
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : block.type === 'comms'
                    ? 'bg-violet-50/50 border-violet-200 text-violet-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700 shrink-0">
                    {block.time}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{block.activity}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    block.type === 'focus'
                      ? 'bg-indigo-600 text-white'
                      : block.type === 'break'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {block.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: FULL ACTIONABLE LIST */}
      {activeViewMode === 'list' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">
              All Tasks ({tasks.length})
            </h4>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  task.completed
                    ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleTaskCheck(task.id)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{task.title}</div>
                  {task.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-1">
                    <span className="font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {task.priorityScore}
                    </span>
                    <span>{task.estimatedMinutes} mins</span>
                    <span>• {task.eisenhowerQuadrant}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
