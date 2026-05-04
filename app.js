(function () {
  "use strict";

  const DATA = window.CRACKTRACK_DATA;
  const STORAGE_KEY = "cracktrack.lux.v10";
  const viewEl = document.getElementById("view");
  const navEl = document.getElementById("bottomNav");
  const modalRoot = document.getElementById("modalRoot");
  const toastRoot = document.getElementById("toastRoot");

  const navItems = [
    { id: "home", label: "Home", icon: "H" },
    { id: "schedule", label: "Schedule", icon: "S" },
    { id: "mcq", label: "MCQs", icon: "Q" },
    { id: "materials", label: "Materials", icon: "M" },
    { id: "progress", label: "Progress", icon: "P" }
  ];

  const extraViews = {
    tasks: "Today's Tasks",
    log: "Study Log",
    mocks: "Mock Tests",
    habits: "Habits / Journal",
    settings: "Settings / Backup",
    content: "Content Library",
    papers: "Previous Year Papers",
    reader: "Reading Mode"
  };

  let currentView = "home";
  let timerHandle = null;
  let toastHandle = null;
  let state = loadState();

  const ui = {
    scheduleEditing: false,
    selectedTaskPhase: "",
    selectedSubjectForLog: DATA.subjects[0].name,
    editLogId: "",
    editMockId: "",
    materialFilter: "All",
    materialQuery: "",
    contentOfficialOnly: false,
    contentSavedOnly: false,
    contentCompletedOnly: false,
    selectedTopics: [],
    quizMode: "quick",
    activeResourceId: "",
    notesDraft: "",
    paperQuery: ""
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    const defaults = {
      userName: "Aman",
      examDate: "2026-05-31",
      schedule: clone(DATA.defaultSchedule),
      autoArrange: false,
      tasksByDate: {},
      studyLogs: [],
      mocks: [],
      quizHistory: [],
      weakTopics: {},
      habits: {},
      materials: {
        bookmarked: [],
        completed: [],
        revision: [],
        notes: {},
        opened: []
      },
      paperBookmarks: [],
      paperCompleted: [],
      appVersion: 10
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        schedule: Array.isArray(parsed.schedule) && parsed.schedule.length ? parsed.schedule : defaults.schedule,
        tasksByDate: parsed.tasksByDate || {},
        studyLogs: Array.isArray(parsed.studyLogs) ? parsed.studyLogs : [],
        mocks: Array.isArray(parsed.mocks) ? parsed.mocks : [],
        quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
        weakTopics: parsed.weakTopics || {},
        habits: parsed.habits || {},
        materials: {
          ...defaults.materials,
          ...(parsed.materials || {})
        },
        paperBookmarks: Array.isArray(parsed.paperBookmarks) ? parsed.paperBookmarks : [],
        paperCompleted: Array.isArray(parsed.paperCompleted) ? parsed.paperCompleted : []
      };
    } catch (error) {
      console.warn("Backup parse failed, using defaults.", error);
      return defaults;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function todayKey(offsetDays) {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatTime(value) {
    if (!value) return "";
    const parts = value.split(":").map(Number);
    let hour = parts[0];
    const minute = String(parts[1] || 0).padStart(2, "0");
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return hour + ":" + minute + " " + suffix;
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function daysToExam() {
    const today = new Date(todayKey() + "T00:00:00");
    const exam = new Date(state.examDate + "T00:00:00");
    return Math.ceil((exam - today) / 86400000);
  }

  function phaseForToday() {
    const days = daysToExam();
    if (days <= 10) return "final";
    if (days <= 45) return "mock";
    if (days <= 95) return "scoring";
    return "basics";
  }

  function phaseLabel(id) {
    return {
      basics: "Phase 1: Basics",
      scoring: "Phase 2: High scoring sections",
      mock: "Phase 3: Mock mode",
      final: "Final phase"
    }[id] || "Phase";
  }

  function ensureTodayTasks() {
    const date = todayKey();
    if (state.tasksByDate[date] && state.tasksByDate[date].length) return state.tasksByDate[date];
    const phase = phaseForToday();
    state.tasksByDate[date] = DATA.phaseTasks[phase].map(function (item, index) {
      return {
        id: uid("task" + index),
        title: item[0],
        detail: item[1],
        subject: item[2],
        topics: item[3],
        phase,
        done: false,
        custom: false
      };
    });
    saveState();
    return state.tasksByDate[date];
  }

  function getTodayTasks() {
    return ensureTodayTasks();
  }

  function getSubject(name) {
    return DATA.subjects.find(function (subject) {
      return subject.name === name || subject.id === name;
    }) || DATA.subjects[0];
  }

  function allTopicNames() {
    return DATA.subjects.flatMap(function (subject) { return subject.topics; });
  }

  function getStudiedTopicObjects() {
    const map = new Map();
    state.studyLogs.forEach(function (log) {
      (log.topics || []).forEach(function (topic) {
        map.set(topic, { topic, subject: log.subject, source: "Study Log" });
      });
    });
    DATA.materialResources.forEach(function (res) {
      if (state.materials.completed.includes(res.id) || state.materials.bookmarked.includes(res.id) || state.materials.opened.includes(res.id)) {
        (res.tags || []).forEach(function (tag) {
          const subject = DATA.subjects.find(function (s) { return s.topics.includes(tag) || s.name === res.subject; });
          if (subject && subject.topics.includes(tag)) {
            map.set(tag, { topic: tag, subject: subject.name, source: "Material" });
          }
        });
      }
    });
    Object.keys(state.weakTopics || {}).forEach(function (key) {
      const topic = key.split("|")[1] || key;
      const subject = key.split("|")[0] || "";
      if (state.weakTopics[key] > 0) map.set(topic, { topic, subject, source: "Weak Topic" });
    });
    return Array.from(map.values());
  }

  function getSelectedTopicsFallback() {
    const studied = getStudiedTopicObjects();
    if (studied.length) return studied.map(function (item) { return item.topic; });
    return ["Series", "Percentage", "Sikh Gurus", "Computer basics", "Current affairs", "Punjabi culture"];
  }

  function getStats() {
    const today = todayKey();
    const tasks = getTodayTasks();
    const done = tasks.filter(function (task) { return task.done; }).length;
    const todayHours = state.studyLogs
      .filter(function (log) { return log.date === today; })
      .reduce(function (sum, log) { return sum + Number(log.hours || 0); }, 0);
    const quizzesToday = state.quizHistory.filter(function (quiz) { return quiz.date === today; });
    const totalCorrect = quizzesToday.reduce(function (sum, quiz) { return sum + quiz.correct; }, 0);
    const totalQuestions = quizzesToday.reduce(function (sum, quiz) { return sum + quiz.total; }, 0);
    const allCorrect = state.quizHistory.reduce(function (sum, quiz) { return sum + quiz.correct; }, 0);
    const allQuestions = state.quizHistory.reduce(function (sum, quiz) { return sum + quiz.total; }, 0);
    const mockAvg = state.mocks.length
      ? Math.round(state.mocks.reduce(function (sum, mock) { return sum + Number(mock.score || 0); }, 0) / state.mocks.length)
      : 0;
    const habit = state.habits[today] || {};
    const habitChecks = habit.checks || {};
    const habitScore = Math.round(Object.values(habitChecks).filter(Boolean).length / 8 * 100) || 0;
    const completedTopics = new Set();
    state.studyLogs.forEach(function (log) { (log.topics || []).forEach(function (topic) { completedTopics.add(topic); }); });
    const topicsPct = Math.round(completedTopics.size / allTopicNames().length * 100) || 0;
    const taskPct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    const accuracy = totalQuestions ? Math.round(totalCorrect / totalQuestions * 100) : (allQuestions ? Math.round(allCorrect / allQuestions * 100) : 0);
    const consistency = getStudyStreak().current;
    const overall = Math.round((topicsPct * 0.34) + (taskPct * 0.22) + (accuracy * 0.2) + (mockAvg * 0.16) + (Math.min(consistency, 10) * 8 * 0.08));
    return {
      todayHours,
      taskDone: done,
      taskTotal: tasks.length,
      taskPct,
      accuracy,
      allAccuracy: allQuestions ? Math.round(allCorrect / allQuestions * 100) : 0,
      mockAvg,
      habitScore,
      completedTopics: completedTopics.size,
      topicsPct,
      consistency,
      overall: clamp(overall, 0, 100),
      quizCount: state.quizHistory.length,
      mockCount: state.mocks.length
    };
  }

  function getStudyStreak() {
    let current = 0;
    for (let i = 0; i < 90; i += 1) {
      const date = todayKey(-i);
      const hasLog = state.studyLogs.some(function (log) { return log.date === date && Number(log.hours || 0) > 0; });
      const habit = state.habits[date];
      const didStudy = habit && habit.checks && habit.checks.study;
      if (hasLog || didStudy) current += 1;
      else if (i > 0) break;
      else break;
    }
    let best = 0;
    let run = 0;
    for (let i = 89; i >= 0; i -= 1) {
      const date = todayKey(-i);
      const hasLog = state.studyLogs.some(function (log) { return log.date === date && Number(log.hours || 0) > 0; });
      const habit = state.habits[date];
      const didStudy = habit && habit.checks && habit.checks.study;
      if (hasLog || didStudy) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }
    return { current, best };
  }

  function getSubjectProgress() {
    const totals = {};
    DATA.subjects.forEach(function (subject) {
      totals[subject.name] = { subject: subject.name, color: subject.color, topics: new Set(), hours: 0, mcqs: 0, total: subject.topics.length };
    });
    state.studyLogs.forEach(function (log) {
      if (!totals[log.subject]) {
        totals[log.subject] = { subject: log.subject, color: "#d6a94d", topics: new Set(), hours: 0, mcqs: 0, total: 10 };
      }
      (log.topics || []).forEach(function (topic) { totals[log.subject].topics.add(topic); });
      totals[log.subject].hours += Number(log.hours || 0);
      totals[log.subject].mcqs += Number(log.mcqs || 0);
    });
    return Object.values(totals).map(function (item) {
      const topicScore = item.total ? (item.topics.size / item.total * 100) : 0;
      const activityScore = Math.min(100, item.hours * 5 + item.mcqs / 4);
      return {
        ...item,
        topicsDone: item.topics.size,
        pct: Math.round(Math.max(topicScore, activityScore * 0.5))
      };
    });
  }

  function bestAndNeeds() {
    const progress = getSubjectProgress().filter(function (item) { return item.hours || item.mcqs || item.topicsDone; });
    if (!progress.length) return { best: "Start logging", needs: "Start logging" };
    const sorted = progress.slice().sort(function (a, b) { return b.pct - a.pct; });
    return { best: sorted[0].subject, needs: sorted[sorted.length - 1].subject };
  }

  function topWeakTopics(limit) {
    return Object.entries(state.weakTopics || {})
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, limit || 6)
      .map(function (entry) {
        const parts = entry[0].split("|");
        return { subject: parts[0], topic: parts[1], count: entry[1] };
      });
  }

  function iconForType(type) {
    return {
      Official: "OF",
      PDF: "PDF",
      Article: "AR",
      Practice: "PR",
      Video: "VI",
      Notes: "NO",
      "Current Affairs": "CA"
    }[type] || "R";
  }

  function toast(message) {
    window.clearTimeout(toastHandle);
    toastRoot.innerHTML = '<div class="toast">' + escapeHtml(message) + "</div>";
    toastHandle = window.setTimeout(function () {
      toastRoot.innerHTML = "";
    }, 2600);
  }

  function openModal(html) {
    modalRoot.innerHTML = '<div class="modal">' + html + "</div>";
  }

  function closeModal() {
    modalRoot.innerHTML = "";
  }

  function renderNav() {
    navEl.innerHTML = navItems.map(function (item) {
      const active = currentView === item.id || (currentView === "content" && item.id === "materials") || (currentView === "papers" && item.id === "materials");
      return '<button class="nav-btn ' + (active ? "active" : "") + '" data-view="' + item.id + '" aria-current="' + (active ? "page" : "false") + '">' +
        '<span class="nav-icon">' + item.icon + "</span><span>" + item.label + "</span></button>";
    }).join("");
  }

  function pageChrome(title, subtitle, actions) {
    return '<header class="topbar">' +
      '<div class="brand-row">' +
      '<div class="brand-mark"><span>CT</span></div>' +
      '<div class="brand-copy"><p class="eyebrow">Good Evening, ' + escapeHtml(state.userName || "Aman") + '</p><h1 class="app-title">CrackTrack</h1></div>' +
      '</div>' +
      '<div class="topbar-actions action-row">' + (actions || "") + '</div>' +
      '</header>' +
      (title ? '<section class="section-head"><div><h2 class="page-title">' + escapeHtml(title) + '</h2>' + (subtitle ? '<p class="page-subtitle">' + subtitle + '</p>' : '') + '</div></section>' : '');
  }

  function statCard(label, value, sub, accentClass) {
    return '<article class="card ' + (accentClass || "") + '">' +
      '<p class="card-kicker">' + escapeHtml(label) + '</p>' +
      '<div class="stat-value">' + value + '</div>' +
      '<p class="stat-sub">' + escapeHtml(sub) + '</p>' +
      '</article>';
  }

  function renderHome() {
    const stats = getStats();
    const days = daysToExam();
    const phase = phaseForToday();
    const tasks = getTodayTasks();
    const weak = topWeakTopics(3);
    const recommendations = weak.length ? weak : [
      { subject: "Reasoning", topic: "Reasoning Practice", count: 0 },
      { subject: "GK/Current Affairs", topic: "Current Affairs Revision", count: 0 },
      { subject: "Punjab History", topic: "Punjab History Review", count: 0 }
    ];
    return pageChrome("", "", '<button class="btn secondary" data-view="settings">Settings</button>') +
      '<section class="hero">' +
      '<div class="hero-panel"><div class="hero-content">' +
      '<div><p class="eyebrow">Punjab Excise Inspector command center</p><h2 class="page-title">Good Evening, ' + escapeHtml(state.userName || "Aman") + '</h2><p class="page-subtitle">Luxury dark workspace for schedule, study logs, content, MCQs, mocks, habits, and backup.</p></div>' +
      '<div class="pill-row"><span class="badge gold">' + (days >= 0 ? days + ' days left' : Math.abs(days) + ' days past') + '</span><span class="badge blue">' + phaseLabel(phase) + '</span><span class="badge green">' + stats.consistency + ' day streak</span></div>' +
      '<div class="hero-actions"><button class="btn" data-action="generate-today-quiz">Generate Quiz From Today\'s Study</button><button class="btn secondary" data-view="tasks">Today\'s Tasks</button><button class="btn blue" data-view="content">Content Library</button></div>' +
      '</div></div>' +
      '<div class="card lux-card"><div class="ring-wrap"><div class="ring" style="--pct:' + stats.overall + '"><strong>' + stats.overall + '%</strong></div><div><h3 class="card-title">Overall Progress</h3><p class="small">Blends topics completed, daily task execution, MCQ accuracy, mock average, and consistency.</p><div class="progress-line" style="margin-top:12px"><span style="--pct:' + stats.overall + '%"></span></div><div class="action-row" style="margin-top:14px"><button class="btn secondary" data-view="progress">View analytics</button><button class="btn ghost" data-action="export-backup">Export</button></div></div></div></div>' +
      '</section>' +
      '<section class="grid four">' +
      statCard("Today Study Hours", stats.todayHours.toFixed(1) + "h", "Target window: 9 AM-5 PM plus night revision", "lux-card") +
      statCard("Daily MCQ Accuracy", stats.accuracy + "%", "Updates after every submitted quiz", "") +
      statCard("Mock Test Average", stats.mockAvg + "%", "Target: 75% and rising", "") +
      statCard("Habit Score", stats.habitScore + "%", "Running, study, MCQs, revision, sleep", "") +
      '</section>' +
      '<section class="grid dashboard-grid" style="margin-top:16px">' +
      '<div class="grid">' +
      renderPlanCard() +
      renderTasksPreview(tasks) +
      '</div>' +
      '<div class="grid">' +
      renderRecommendations(recommendations) +
      renderQuickAccess() +
      '</div>' +
      '</section>';
  }

  function renderPlanCard() {
    const blocks = state.schedule.slice().sort(function (a, b) { return a.start.localeCompare(b.start); });
    return '<article class="card"><div class="card-head"><div><h3 class="card-title">Today\'s Plan Timeline</h3><p class="card-kicker">Editable daily rhythm</p></div><button class="btn secondary" data-view="schedule">Edit schedule</button></div>' +
      '<div class="timeline" style="margin-top:12px">' + blocks.map(function (block) {
        return '<div class="timeline-item"><div class="time-pill">' + formatTime(block.start) + '<br>' + formatTime(block.end) + '</div>' +
          '<div class="timeline-body" style="border-left:3px solid ' + escapeHtml(block.color || "#d6a94d") + '"><strong>' + escapeHtml(block.title) + '</strong><p class="small">' + escapeHtml(block.description || block.category) + '</p></div></div>';
      }).join("") + '</div></article>';
  }

  function renderTasksPreview(tasks) {
    const done = tasks.filter(function (task) { return task.done; }).length;
    return '<article class="card"><div class="card-head"><div><h3 class="card-title">Today\'s Tasks Checklist</h3><p class="card-kicker">' + done + '/' + tasks.length + ' complete</p></div><button class="btn secondary" data-view="tasks">Open tasks</button></div>' +
      '<div class="progress-line" style="margin:12px 0"><span style="--pct:' + (tasks.length ? Math.round(done / tasks.length * 100) : 0) + '%"></span></div>' +
      '<div class="list">' + tasks.slice(0, 5).map(function (task) {
        return '<div class="task-row task-item"><button class="checkbox ' + (task.done ? "done" : "") + '" data-action="toggle-task" data-id="' + task.id + '">' + (task.done ? "✓" : "") + '</button><div><strong class="task-title ' + (task.done ? "done" : "") + '">' + escapeHtml(task.title) + '</strong><p class="small">' + escapeHtml(task.detail) + '</p></div><span class="badge blue">' + escapeHtml(task.subject) + '</span></div>';
      }).join("") + '</div></article>';
  }

  function renderRecommendations(items) {
    return '<article class="card lux-card"><div class="card-head"><div><h3 class="card-title">Smart Recommendations</h3><p class="card-kicker">Generated from weak areas and study history</p></div></div>' +
      '<div class="list" style="margin-top:12px">' + items.map(function (item) {
        const topic = item.topic.replace(" Practice", "").replace(" Revision", "").replace(" Review", "");
        return '<div class="dense-card glass-card"><div class="item-head"><div><strong>' + escapeHtml(item.topic) + '</strong><p class="small">' + (item.count ? item.count + ' misses detected' : 'High-value daily target') + '</p></div><button class="btn secondary" data-action="quiz-topic" data-topic="' + escapeHtml(topic) + '">Practice</button></div></div>';
      }).join("") + '</div></article>';
  }

  function renderQuickAccess() {
    const cards = [
      ["log", "Study Log", "Add topics studied and feed MCQ generation."],
      ["mocks", "Mock Tests", "Track scores and weak topics."],
      ["habits", "Habits / Journal", "Protect running, revision, phone control, and sleep."],
      ["papers", "Previous Papers", "Open public links or practice pattern-based papers."],
      ["content", "Content Library", "Official resources, notes, and free web material."],
      ["settings", "Backup", "Export, import, reset, and exam-date settings."]
    ];
    return '<article class="card"><h3 class="card-title">More Tools</h3><div class="grid two" style="margin-top:12px">' + cards.map(function (card) {
      return '<button class="dense-card glass-card" data-view="' + card[0] + '" style="text-align:left;color:var(--text);background:rgba(255,255,255,.04)"><strong>' + card[1] + '</strong><p class="small" style="margin-top:6px">' + card[2] + '</p></button>';
    }).join("") + '</div></article>';
  }

  function renderSchedule() {
    const stats = getStats();
    const schedule = state.schedule.slice().sort(function (a, b) { return a.start.localeCompare(b.start); });
    return pageChrome("Schedule & Progress", "Editable daily routine, calendar progress, weekly goals, streaks, subject progress, and mock trend.", '<button class="btn" data-action="toggle-schedule-edit">' + (ui.scheduleEditing ? "Close edit" : "Edit Schedule") + '</button><button class="btn secondary" data-view="tasks">Daily Tasks</button>') +
      '<section class="grid split-layout">' +
      '<div class="grid">' +
      '<article class="card lux-card"><div class="card-head"><div><h3 class="card-title">Daily Routine</h3><p class="card-kicker">Saved to localStorage</p></div><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="autoArrangeToggle" ' + (state.autoArrange ? "checked" : "") + ' style="width:auto;min-height:auto"> Auto Arrange</label></div>' +
      (ui.scheduleEditing ? renderScheduleEditor() : renderScheduleList(schedule)) +
      '</article>' +
      '<article class="card"><div class="card-head"><div><h3 class="card-title">Weekly Goals</h3><p class="card-kicker">Study hours, tasks, MCQs, mocks</p></div></div>' + renderWeeklyGoals() + '</article>' +
      '</div>' +
      '<div class="grid">' +
      '<article class="card"><h3 class="card-title">Calendar Progress</h3>' + renderCalendarHeatmap() + '</article>' +
      '<article class="card"><h3 class="card-title">Streak Calendar</h3><p class="small">Current streak: ' + stats.consistency + ' days</p>' + renderCalendarHeatmap(true) + '</article>' +
      '<article class="card"><h3 class="card-title">Subject-wise Progress</h3>' + renderSubjectProgressBars() + '</article>' +
      '<article class="card"><h3 class="card-title">Mock Test Trend</h3>' + renderMockTrend() + '</article>' +
      '</div>' +
      '</section>';
  }

  function renderScheduleList(schedule) {
    return '<div class="timeline" style="margin-top:14px">' + schedule.map(function (block) {
      return '<div class="timeline-item"><div class="time-pill">' + formatTime(block.start) + '<br>' + formatTime(block.end) + '</div><div class="timeline-body" style="border-left:3px solid ' + escapeHtml(block.color || "#d6a94d") + '"><div class="item-head"><div><strong>' + escapeHtml(block.title) + '</strong><p class="small">' + escapeHtml(block.category) + ' - ' + escapeHtml(block.description || "") + '</p></div><button class="btn secondary" data-action="schedule-focus" data-title="' + escapeHtml(block.title) + '">Start</button></div></div></div>';
    }).join("") + '</div>';
  }

  function renderScheduleEditor() {
    return '<div class="list" style="margin-top:14px">' + state.schedule.map(function (block, index) {
      const isDefault = ["run", "study", "revision"].includes(block.id);
      return '<div class="task-item">' +
        '<div class="form-grid">' +
        '<label>Title<input class="schedule-field" data-index="' + index + '" data-field="title" value="' + escapeHtml(block.title) + '"></label>' +
        '<label>Category<input class="schedule-field" data-index="' + index + '" data-field="category" value="' + escapeHtml(block.category) + '"></label>' +
        '<label>Start<input type="time" class="schedule-field" data-index="' + index + '" data-field="start" value="' + escapeHtml(block.start) + '"></label>' +
        '<label>End<input type="time" class="schedule-field" data-index="' + index + '" data-field="end" value="' + escapeHtml(block.end) + '"></label>' +
        '<label>Color<input type="color" class="schedule-field" data-index="' + index + '" data-field="color" value="' + escapeHtml(block.color || "#d6a94d") + '"></label>' +
        '<label class="wide">Description<textarea class="schedule-field" data-index="' + index + '" data-field="description">' + escapeHtml(block.description || "") + '</textarea></label>' +
        '</div><div class="action-row" style="margin-top:10px">' + (!isDefault ? '<button class="btn danger" data-action="delete-schedule-block" data-id="' + block.id + '">Delete custom block</button>' : '<span class="badge gold">Default block</span>') + '</div></div>';
    }).join("") +
      '<div class="action-row"><button class="btn secondary" data-action="add-schedule-block">Add custom block</button><button class="btn" data-action="save-schedule">Save schedule changes</button></div></div>';
  }

  function renderWeeklyGoals() {
    const start = new Date(todayKey() + "T00:00:00");
    start.setDate(start.getDate() - 6);
    const weekLogs = state.studyLogs.filter(function (log) {
      return new Date(log.date + "T00:00:00") >= start;
    });
    const hours = weekLogs.reduce(function (sum, log) { return sum + Number(log.hours || 0); }, 0);
    const mcqs = weekLogs.reduce(function (sum, log) { return sum + Number(log.mcqs || 0); }, 0);
    const mocks = state.mocks.filter(function (mock) { return new Date(mock.date + "T00:00:00") >= start; }).length;
    const tasksDone = Object.entries(state.tasksByDate).filter(function (entry) {
      return new Date(entry[0] + "T00:00:00") >= start;
    }).reduce(function (sum, entry) { return sum + entry[1].filter(function (task) { return task.done; }).length; }, 0);
    const goals = [
      ["Study hours", hours, 54, "h"],
      ["Tasks done", tasksDone, 28, ""],
      ["MCQs solved", mcqs, 350, ""],
      ["Mocks logged", mocks, 3, ""]
    ];
    return '<div class="grid two" style="margin-top:12px">' + goals.map(function (goal) {
      const pct = clamp(Math.round(goal[1] / goal[2] * 100), 0, 100);
      return '<div class="dense-card glass-card"><div class="item-head"><strong>' + goal[0] + '</strong><span class="badge">' + goal[1].toFixed(goal[3] ? 1 : 0) + goal[3] + '/' + goal[2] + goal[3] + '</span></div><div class="progress-line" style="margin-top:10px"><span style="--pct:' + pct + '%"></span></div></div>';
    }).join("") + '</div>';
  }

  function renderCalendarHeatmap(streakMode) {
    let html = '<div class="calendar-grid" style="margin-top:12px">';
    for (let i = 27; i >= 0; i -= 1) {
      const date = todayKey(-i);
      const logs = state.studyLogs.filter(function (log) { return log.date === date; });
      const tasks = state.tasksByDate[date] || [];
      const habit = state.habits[date];
      const hot = streakMode
        ? (logs.some(function (log) { return Number(log.hours || 0) > 0; }) || (habit && habit.checks && habit.checks.study))
        : (logs.length || tasks.some(function (task) { return task.done; }));
      html += '<div class="day-cell ' + (hot ? "hot" : "") + '" title="' + date + '">' + String(new Date(date + "T00:00:00").getDate()) + '</div>';
    }
    return html + '</div>';
  }

  function renderSubjectProgressBars() {
    const progress = getSubjectProgress();
    return '<div class="list" style="margin-top:12px">' + progress.map(function (item) {
      return '<div><div class="item-head"><div class="pill-row"><span class="subject-dot" style="--accent:' + item.color + '"></span><strong>' + escapeHtml(item.subject) + '</strong></div><span class="badge">' + item.pct + '%</span></div><div class="progress-line" style="margin-top:8px"><span style="--pct:' + item.pct + '%"></span></div><p class="small" style="margin-top:5px">' + item.topicsDone + '/' + item.total + ' topics, ' + item.hours.toFixed(1) + 'h, ' + item.mcqs + ' MCQs</p></div>';
    }).join("") + '</div>';
  }

  function renderMockTrend() {
    if (!state.mocks.length) return '<div class="empty" style="margin-top:12px">No mocks yet. Add one from Mock Tests.</div>';
    const recent = state.mocks.slice(-8);
    return '<div class="bars">' + recent.map(function (mock) {
      return '<div class="bar"><span style="height:' + clamp(mock.score, 4, 100) + '%"></span><small>' + escapeHtml(mock.name).slice(0, 8) + '<br>' + mock.score + '</small></div>';
    }).join("") + '</div>';
  }

  function renderTasks() {
    const phase = ui.selectedTaskPhase || phaseForToday();
    const tasks = getTodayTasks();
    const done = tasks.filter(function (task) { return task.done; }).length;
    return pageChrome("Today's Tasks", "Phase-based Punjab Excise Inspector preparation with custom tasks, editing, deletion, and saved completion progress.", '<button class="btn" data-action="generate-today-quiz">Generate Quiz From Today\'s Study</button>') +
      '<section class="grid split-layout">' +
      '<article class="card lux-card"><div class="card-head"><div><h3 class="card-title">' + phaseLabel(phaseForToday()) + '</h3><p class="card-kicker">Auto-loaded for ' + formatDate(todayKey()) + '</p></div><span class="badge gold">' + done + '/' + tasks.length + ' done</span></div>' +
      '<div class="progress-line" style="margin:14px 0"><span style="--pct:' + (tasks.length ? Math.round(done / tasks.length * 100) : 0) + '%"></span></div>' +
      '<div class="tabs">' + ["basics", "scoring", "mock", "final"].map(function (key) {
        return '<button class="chip ' + (phase === key ? "active" : "") + '" data-action="select-task-phase" data-phase="' + key + '">' + phaseLabel(key) + '</button>';
      }).join("") + '</div>' +
      '<div class="action-row" style="margin:12px 0"><button class="btn secondary" data-action="regenerate-tasks" data-phase="' + phase + '">Load selected phase</button><button class="btn ghost" data-action="add-phase-tasks" data-phase="' + phase + '">Add phase tasks</button></div>' +
      '<div class="list">' + tasks.map(renderTaskItem).join("") + '</div></article>' +
      '<aside class="card"><h3 class="card-title">Add Custom Task</h3><div class="form-grid" style="margin-top:12px">' +
      '<label>Title<input id="customTaskTitle" placeholder="e.g. Revise Sikh Gurus table"></label>' +
      '<label>Subject<select id="customTaskSubject">' + DATA.subjects.map(function (s) { return '<option>' + escapeHtml(s.name) + '</option>'; }).join("") + '<option>Mock Tests</option><option>Revision</option></select></label>' +
      '<label class="wide">Details<textarea id="customTaskDetail" placeholder="Task details"></textarea></label>' +
      '<label class="wide">Topics<input id="customTaskTopics" placeholder="Comma separated topics"></label>' +
      '</div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="add-custom-task">Add task</button><button class="btn secondary" data-action="clear-completed-tasks">Clear done</button></div>' +
      '</aside></section>';
  }

  function renderTaskItem(task) {
    return '<div class="task-row task-item"><button class="checkbox ' + (task.done ? "done" : "") + '" data-action="toggle-task" data-id="' + task.id + '">' + (task.done ? "✓" : "") + '</button>' +
      '<div><strong class="task-title ' + (task.done ? "done" : "") + '">' + escapeHtml(task.title) + '</strong><p class="small">' + escapeHtml(task.detail || "") + '</p><div class="pill-row" style="margin-top:8px"><span class="badge blue">' + escapeHtml(task.subject || "Study") + '</span>' + (task.topics || []).slice(0, 3).map(function (topic) { return '<span class="badge">' + escapeHtml(topic) + '</span>'; }).join("") + '</div></div>' +
      '<div class="action-row"><button class="icon-btn" title="Edit task" data-action="edit-task" data-id="' + task.id + '">Edit</button><button class="icon-btn" title="Delete task" data-action="delete-task" data-id="' + task.id + '">Del</button></div></div>';
  }

  function renderMCQ() {
    const stats = getStats();
    const studied = getStudiedTopicObjects();
    const fallbackTopics = getSelectedTopicsFallback();
    const selected = ui.selectedTopics.length ? ui.selectedTopics : fallbackTopics.slice(0, 4);
    const quiz = state.activeQuiz;
    return pageChrome("Topic-Based MCQ Practice", "Quizzes generate from studied topics, completed materials, bookmarked resources, weak areas, and previous-paper practice.", '<button class="btn secondary" data-action="review-mistakes">Review Mistakes</button><button class="btn" data-action="generate-revision-quiz">Revision Quiz</button>') +
      '<section class="grid split-layout">' +
      '<aside class="card">' +
      '<div class="card-head"><div><h3 class="card-title">Studied Topics</h3><p class="card-kicker">' + (studied.length ? "From logs/materials/weak areas" : "Default topics shown until study logs exist") + '</p></div><span class="badge gold">' + DATA.questionBank.length + '+ MCQs</span></div>' +
      '<div class="chip-row" style="margin:12px 0">' + (studied.length ? studied : fallbackTopics.map(function (topic) { return { topic, subject: "Default", source: "Default" }; })).map(function (item) {
        const active = selected.includes(item.topic);
        return '<button class="topic-chip ' + (active ? "active" : "") + '" data-action="toggle-topic" data-topic="' + escapeHtml(item.topic) + '">' + escapeHtml(item.topic) + '</button>';
      }).join("") + '</div>' +
      '<div class="tabs">' + [
        ["quick", "Quick 10"],
        ["practice", "Practice 25"],
        ["timed", "Timed 50"],
        ["full", "Full Mock 100"]
      ].map(function (mode) {
        return '<button class="chip ' + (ui.quizMode === mode[0] ? "active" : "") + '" data-action="set-quiz-mode" data-mode="' + mode[0] + '">' + mode[1] + '</button>';
      }).join("") + '</div>' +
      '<div class="action-row" style="margin-top:12px"><button class="btn" data-action="start-quiz">Generate Quiz</button><button class="btn secondary" data-action="weak-quiz">Generate Weak Area Quiz</button><button class="btn ghost" data-action="full-syllabus-quiz">Full Mock Based on Syllabus</button></div>' +
      '<div class="grid two" style="margin-top:14px">' + statCard("Accuracy", stats.allAccuracy + "%", "All quiz history", "") + statCard("Quiz Streak", getQuizStreak() + " days", "Submitted quiz days", "") + '</div>' +
      '</aside>' +
      '<div class="card lux-card">' + (quiz ? renderActiveQuiz(quiz) : renderQuizEmpty(selected)) + '</div>' +
      '</section>';
  }

  function getQuizStreak() {
    let streak = 0;
    for (let i = 0; i < 90; i += 1) {
      const date = todayKey(-i);
      if (state.quizHistory.some(function (quiz) { return quiz.date === date; })) streak += 1;
      else if (i > 0) break;
      else break;
    }
    return streak;
  }

  function renderQuizEmpty(selected) {
    return '<div class="empty"><h3 class="card-title">Quiz deck ready</h3><p class="small">Selected topics: ' + selected.map(escapeHtml).join(", ") + '</p><div class="action-row" style="margin-top:12px"><button class="btn" data-action="start-quiz">Generate Quiz</button><button class="btn secondary" data-view="log">Add Study Log First</button></div></div>';
  }

  function renderActiveQuiz(quiz) {
    const q = quiz.questions[quiz.index];
    const selected = quiz.answers[q.id];
    const submitted = quiz.submitted;
    const remaining = quiz.timed ? Math.max(0, quiz.endsAt - Date.now()) : 0;
    return '<div class="quiz-toolbar"><div class="item-head"><div><strong>' + escapeHtml(quiz.title) + '</strong><p class="small">Question ' + (quiz.index + 1) + ' of ' + quiz.questions.length + (quiz.timed ? ' - Timer ' + msToClock(remaining) : '') + '</p></div><div class="action-row"><button class="btn secondary" data-action="restart-quiz">Restart</button><button class="btn" data-action="submit-quiz" ' + (submitted ? "disabled" : "") + '>Submit Quiz</button></div></div><div class="progress-line" style="margin-top:10px"><span style="--pct:' + Math.round((quiz.index + 1) / quiz.questions.length * 100) + '%"></span></div></div>' +
      '<div class="question-card"><div class="pill-row"><span class="badge blue">' + escapeHtml(q.subject) + '</span><span class="badge">' + escapeHtml(q.topic) + '</span></div><h3 style="margin:14px 0;font-size:20px;line-height:1.35">' + escapeHtml(q.stem) + '</h3><div class="list">' + q.options.map(function (option, index) {
        let cls = "";
        if (selected === index) cls = "selected";
        if (submitted && index === q.answer) cls = "correct";
        if (submitted && selected === index && selected !== q.answer) cls = "wrong";
        return '<button class="option ' + cls + '" data-action="answer-question" data-id="' + q.id + '" data-option="' + index + '" ' + (submitted ? "disabled" : "") + '><span class="option-letter">' + String.fromCharCode(65 + index) + '</span><span>' + escapeHtml(option) + '</span></button>';
      }).join("") + '</div>' +
      (submitted ? '<div class="safe-note" style="margin-top:14px"><strong>Explanation:</strong> ' + escapeHtml(q.explanation) + '</div>' : '') +
      '</div><div class="action-row" style="margin-top:12px"><button class="btn secondary" data-action="prev-question" ' + (quiz.index === 0 ? "disabled" : "") + '>Previous</button><button class="btn secondary" data-action="next-question" ' + (quiz.index >= quiz.questions.length - 1 ? "disabled" : "") + '>Next</button>' + (submitted ? '<button class="btn" data-action="review-incorrect-current">Review Mistakes</button>' : '') + '</div>' +
      (submitted ? renderQuizResult(quiz) : "");
  }

  function renderQuizResult(quiz) {
    const correct = quiz.questions.filter(function (q) { return quiz.answers[q.id] === q.answer; }).length;
    const pct = Math.round(correct / quiz.questions.length * 100);
    return '<div class="card" style="margin-top:12px"><div class="card-head"><div><h3 class="card-title">Score: ' + correct + '/' + quiz.questions.length + ' (' + pct + '%)</h3><p class="card-kicker">Saved to quiz history and weak-topic tracker</p></div><button class="btn green" data-action="generate-revision-quiz">Generate Revision Quiz</button></div></div>';
  }

  function msToClock(ms) {
    const total = Math.ceil(ms / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  function renderMaterials() {
    return pageChrome("Free Study Materials", "Search, filter, bookmark, complete, read inside the app, and generate quizzes from legal public/free resources.", '<button class="btn secondary" data-view="content">Content Library</button><button class="btn" data-view="papers">Previous Papers</button>') +
      renderMaterialsContent(false);
  }

  function renderContentLibrary() {
    return pageChrome("Content Library", "Official resources, previous papers, free web resources, current affairs, reading mode, and local update structure.", '<button class="btn secondary" data-action="refresh-content">Refresh Content Library</button><button class="btn" data-view="papers">Previous Papers</button>') +
      renderMaterialsContent(true);
  }

  function renderMaterialsContent(advanced) {
    const filters = ["All", "Notes", "PDF", "Video", "Article", "Practice", "Current Affairs", "Punjab GK", "Official"];
    const query = ui.materialQuery.trim().toLowerCase();
    let resources = DATA.materialResources.filter(function (res) {
      const text = [res.title, res.subject, res.topic, res.type, res.sourceName, (res.tags || []).join(" ")].join(" ").toLowerCase();
      const filterOk = ui.materialFilter === "All" ||
        res.type === ui.materialFilter ||
        res.subject === ui.materialFilter ||
        res.topic === ui.materialFilter ||
        (ui.materialFilter === "Official" && /official/i.test(res.sourceBadge));
      const queryOk = !query || text.includes(query);
      const officialOk = !ui.contentOfficialOnly || /official/i.test(res.sourceBadge);
      const savedOk = !ui.contentSavedOnly || state.materials.bookmarked.includes(res.id);
      const completedOk = !ui.contentCompletedOnly || state.materials.completed.includes(res.id);
      return filterOk && queryOk && officialOk && savedOk && completedOk;
    });
    const recommended = getRecommendedResources().slice(0, 4);
    return '<section class="content-layout">' +
      '<aside class="card"><h3 class="card-title">Search Library</h3><div class="form-grid" style="margin-top:12px"><label class="wide">Search by subject, topic, year, type, source<input id="materialSearchInput" value="' + escapeHtml(ui.materialQuery) + '" placeholder="e.g. Sikh Gurus, ICT, official, current affairs"></label></div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="run-material-search">Search</button><button class="btn secondary" data-action="clear-material-search">Clear</button></div>' +
      '<div class="filter-row" style="margin-top:14px">' + filters.map(function (filter) {
        return '<button class="chip ' + (ui.materialFilter === filter ? "active" : "") + '" data-action="set-material-filter" data-filter="' + filter + '">' + filter + '</button>';
      }).join("") + '</div>' +
      (advanced ? '<div class="list" style="margin-top:14px"><button class="chip ' + (ui.contentOfficialOnly ? "active" : "") + '" data-action="toggle-official-only">Official only</button><button class="chip ' + (ui.contentSavedOnly ? "active" : "") + '" data-action="toggle-saved-only">Saved resources</button><button class="chip ' + (ui.contentCompletedOnly ? "active" : "") + '" data-action="toggle-completed-only">Completed resources</button></div>' : '') +
      '</aside>' +
      '<div class="grid">' +
      '<article class="card lux-card"><div class="card-head"><div><h3 class="card-title">Recommended from Study History</h3><p class="card-kicker">Based on studied topics, completions, and weak areas</p></div></div><div class="grid two" style="margin-top:12px">' + recommended.map(renderResourceCard).join("") + '</div></article>' +
      '<article class="card"><div class="card-head"><div><h3 class="card-title">Resources</h3><p class="card-kicker">' + resources.length + ' matching legal/free entries</p></div></div><div class="grid two" style="margin-top:12px">' + (resources.length ? resources.map(renderResourceCard).join("") : '<div class="empty">No matching resources.</div>') + '</div></article>' +
      '</div></section>';
  }

  function getRecommendedResources() {
    const studied = getStudiedTopicObjects().map(function (item) { return item.topic.toLowerCase(); });
    const weak = topWeakTopics(6).map(function (item) { return item.topic.toLowerCase(); });
    const signals = studied.concat(weak);
    const scored = DATA.materialResources.map(function (res) {
      const tags = [res.subject, res.topic].concat(res.tags || []).join(" ").toLowerCase();
      const score = signals.reduce(function (sum, signal) { return sum + (tags.includes(signal) ? 2 : 0); }, 0) + (/official/i.test(res.sourceBadge) ? 1 : 0);
      return { res, score };
    }).sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 8).map(function (item) { return item.res; });
  }

  function renderResourceCard(res) {
    const bookmarked = state.materials.bookmarked.includes(res.id);
    const completed = state.materials.completed.includes(res.id);
    return '<div class="resource-item"><div class="item-head"><div><div class="pill-row"><span class="badge gold">' + iconForType(res.type) + '</span><span class="badge ' + (/official/i.test(res.sourceBadge) ? "green" : "blue") + '">' + escapeHtml(res.sourceBadge) + '</span></div><h3 class="card-title" style="margin-top:10px">' + escapeHtml(res.title) + '</h3><p class="small">' + escapeHtml(res.subject) + ' - ' + escapeHtml(res.topic) + ' - ' + escapeHtml(res.sourceName) + '</p></div></div><p class="small" style="margin-top:10px">' + escapeHtml(res.description) + '</p>' +
      '<div class="pill-row" style="margin-top:10px">' + (res.tags || []).slice(0, 4).map(function (tag) { return '<span class="badge">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>' +
      '<div class="action-row" style="margin-top:12px"><button class="btn" data-action="open-resource" data-id="' + res.id + '">Open inside app</button><button class="btn secondary" data-action="open-original" data-id="' + res.id + '">Open original source</button><button class="btn secondary" data-action="bookmark-resource" data-id="' + res.id + '">' + (bookmarked ? "Saved" : "Save") + '</button><button class="btn secondary" data-action="complete-resource" data-id="' + res.id + '">' + (completed ? "Completed" : "Mark completed") + '</button><button class="btn blue" data-action="quiz-resource" data-id="' + res.id + '">Generate quiz</button></div></div>';
  }

  function renderReader() {
    const res = DATA.materialResources.find(function (item) { return item.id === ui.activeResourceId; }) || DATA.materialResources[0];
    const bookmarked = state.materials.bookmarked.includes(res.id);
    const completed = state.materials.completed.includes(res.id);
    const inRevision = state.materials.revision.includes(res.id);
    const notes = state.materials.notes[res.id] || "";
    return pageChrome("In-App Reading Mode", escapeHtml(res.title), '<button class="btn secondary" data-view="materials">Back to Materials</button><button class="btn" data-action="quiz-resource" data-id="' + res.id + '">Generate Quiz From This Material</button>') +
      '<section class="content-layout"><article class="card lux-card material-reader">' +
      '<div class="pill-row"><span class="badge gold">' + escapeHtml(res.type) + '</span><span class="badge green">' + escapeHtml(res.sourceBadge) + '</span><span class="badge blue">Last checked ' + escapeHtml(res.lastChecked) + '</span></div>' +
      '<h2 class="page-title">' + escapeHtml(res.title) + '</h2><p class="small">Source: ' + escapeHtml(res.sourceName) + (res.url ? ' - <a href="' + escapeHtml(res.url) + '" target="_blank" rel="noopener">open original</a>' : ' - internal CrackTrack note') + '</p>' +
      '<div class="safe-note">External content is summarized in original CrackTrack wording. Source links remain available for full reading and verification.</div>' +
      '<div class="reader-body"><h3>Key Points</h3><ul>' + (res.keyPoints || []).map(function (point) { return '<li>' + escapeHtml(point) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="pill-row">' + (res.tags || []).map(function (tag) { return '<span class="badge">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>' +
      '<div class="action-row"><button class="btn secondary" data-action="bookmark-resource" data-id="' + res.id + '">' + (bookmarked ? "Saved" : "Save/bookmark") + '</button><button class="btn secondary" data-action="complete-resource" data-id="' + res.id + '">' + (completed ? "Studied" : "Mark as Studied") + '</button><button class="btn secondary" data-action="revision-resource" data-id="' + res.id + '">' + (inRevision ? "In Revision" : "Add to Revision") + '</button><button class="btn ghost" data-action="copy-key-points" data-id="' + res.id + '">Copy key points</button><button class="btn blue" data-action="open-original" data-id="' + res.id + '">Open Original Source</button></div>' +
      '</article><aside class="card"><h3 class="card-title">Take Notes</h3><textarea id="resourceNotes" placeholder="Your notes for this resource">' + escapeHtml(notes) + '</textarea><div class="action-row" style="margin-top:12px"><button class="btn" data-action="save-resource-notes" data-id="' + res.id + '">Save notes</button><button class="btn secondary" data-action="quiz-resource" data-id="' + res.id + '">Generate Quiz From This Topic</button></div></aside></section>';
  }

  function renderProgress() {
    const stats = getStats();
    const best = bestAndNeeds();
    const weak = topWeakTopics(8);
    return pageChrome("Progress Dashboard", "Visual analytics update from study logs, MCQs, mocks, habits, completed materials, and weak-topic tracking.", '<button class="btn" data-action="weak-quiz">Generate Weak Area Quiz</button><button class="btn secondary" data-action="export-backup">Export Backup</button>') +
      '<section class="grid four">' +
      statCard("Overall Progress", stats.overall + "%", "All tracker signals", "lux-card") +
      statCard("Completed Topics", stats.completedTopics, "From study logs", "") +
      statCard("Study Consistency", stats.consistency + " days", "Current streak", "") +
      statCard("Best Subject", escapeHtml(best.best), "Highest current score", "") +
      '</section><section class="grid dashboard-grid" style="margin-top:16px"><div class="grid">' +
      '<article class="card"><h3 class="card-title">Subject-wise Progress</h3>' + renderSubjectProgressBars() + '</article>' +
      '<article class="card"><h3 class="card-title">Daily Study Hours</h3>' + renderStudyHoursChart() + '</article>' +
      '<article class="card"><h3 class="card-title">MCQ Accuracy Trend</h3>' + renderAccuracyTrend() + '</article>' +
      '</div><div class="grid">' +
      '<article class="card lux-card"><h3 class="card-title">Needs Improvement</h3><p class="stat-value">' + escapeHtml(best.needs) + '</p><p class="small">Use weak-area and revision quizzes until this changes.</p></article>' +
      '<article class="card"><h3 class="card-title">Weak Areas</h3>' + (weak.length ? '<div class="list" style="margin-top:12px">' + weak.map(function (item) { return '<div class="dense-card glass-card"><div class="item-head"><strong>' + escapeHtml(item.topic) + '</strong><span class="badge red">' + item.count + ' misses</span></div><p class="small">' + escapeHtml(item.subject) + '</p><button class="btn secondary" style="margin-top:10px" data-action="quiz-topic" data-topic="' + escapeHtml(item.topic) + '">Practice topic</button></div>'; }).join("") + '</div>' : '<div class="empty" style="margin-top:12px">No weak topics yet.</div>') + '</article>' +
      '<article class="card"><h3 class="card-title">Mock Test Trend</h3>' + renderMockTrend() + '</article>' +
      '<article class="card"><h3 class="card-title">Streak Calendar</h3>' + renderCalendarHeatmap(true) + '</article>' +
      '</div></section>';
  }

  function renderStudyHoursChart() {
    let days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = todayKey(-i);
      const hours = state.studyLogs.filter(function (log) { return log.date === date; }).reduce(function (sum, log) { return sum + Number(log.hours || 0); }, 0);
      days.push({ label: new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }), value: hours });
    }
    const max = Math.max(1, ...days.map(function (d) { return d.value; }));
    return '<div class="bars">' + days.map(function (day) {
      return '<div class="bar"><span style="height:' + clamp(day.value / max * 100, 5, 100) + '%"></span><small>' + day.label + '<br>' + day.value.toFixed(1) + 'h</small></div>';
    }).join("") + '</div>';
  }

  function renderAccuracyTrend() {
    if (!state.quizHistory.length) return '<div class="empty" style="margin-top:12px">Submit a quiz to see accuracy trend.</div>';
    const recent = state.quizHistory.slice(-8);
    return '<div class="bars">' + recent.map(function (quiz, index) {
      const pct = Math.round(quiz.correct / quiz.total * 100);
      return '<div class="bar"><span style="height:' + clamp(pct, 5, 100) + '%"></span><small>Q' + (index + 1) + '<br>' + pct + '%</small></div>';
    }).join("") + '</div>';
  }

  function renderStudyLog() {
    const subject = getSubject(ui.selectedSubjectForLog);
    const edit = state.studyLogs.find(function (log) { return log.id === ui.editLogId; });
    const chosenTopics = edit ? edit.topics || [] : [];
    return pageChrome("Study Log", "Add sessions with subject, topics, hours, MCQs, and notes. Studied topics automatically feed MCQ generation.", '<button class="btn" data-action="generate-today-quiz">Quiz From Today\'s Study</button>') +
      '<section class="split-layout"><article class="card lux-card"><h3 class="card-title">' + (edit ? "Edit Study Session" : "Add Study Session") + '</h3><div class="form-grid" style="margin-top:12px">' +
      '<label>Date<input id="logDate" type="date" value="' + escapeHtml(edit ? edit.date : todayKey()) + '"></label>' +
      '<label>Subject<select id="logSubject">' + DATA.subjects.map(function (s) { return '<option ' + ((edit ? edit.subject : ui.selectedSubjectForLog) === s.name ? "selected" : "") + '>' + escapeHtml(s.name) + '</option>'; }).join("") + '</select></label>' +
      '<label>Hours<input id="logHours" type="number" min="0" step="0.25" value="' + escapeHtml(edit ? edit.hours : "") + '" placeholder="e.g. 3.5"></label>' +
      '<label>MCQs solved<input id="logMcqs" type="number" min="0" step="1" value="' + escapeHtml(edit ? edit.mcqs : "") + '" placeholder="e.g. 50"></label>' +
      '<label class="wide">Topics studied</label><div class="wide chip-row" id="topicSelect">' + subject.topics.map(function (topic) { return '<button class="topic-chip ' + (chosenTopics.includes(topic) ? "active" : "") + '" data-action="toggle-log-topic" data-topic="' + escapeHtml(topic) + '">' + escapeHtml(topic) + '</button>'; }).join("") + '</div>' +
      '<label class="wide">Notes<textarea id="logNotes" placeholder="Mistakes, formulas, revision cues">' + escapeHtml(edit ? edit.notes : "") + '</textarea></label>' +
      '</div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="save-study-log">' + (edit ? "Save changes" : "Save log") + '</button>' + (edit ? '<button class="btn secondary" data-action="cancel-edit-log">Cancel edit</button>' : '') + '</div></article>' +
      '<aside class="card"><h3 class="card-title">Saved Sessions</h3><div class="list scroll-list" style="margin-top:12px">' + (state.studyLogs.length ? state.studyLogs.slice().reverse().map(renderLogItem).join("") : '<div class="empty">No study logs yet.</div>') + '</div></aside></section>';
  }

  function renderLogItem(log) {
    return '<div class="log-item"><div class="item-head"><div><strong>' + escapeHtml(log.subject) + '</strong><p class="small">' + formatDate(log.date) + ' - ' + Number(log.hours || 0).toFixed(1) + 'h - ' + Number(log.mcqs || 0) + ' MCQs</p></div><div class="action-row"><button class="icon-btn" data-action="edit-log" data-id="' + log.id + '">Edit</button><button class="icon-btn" data-action="delete-log" data-id="' + log.id + '">Del</button></div></div><div class="pill-row" style="margin-top:8px">' + (log.topics || []).map(function (topic) { return '<span class="badge">' + escapeHtml(topic) + '</span>'; }).join("") + '</div><p class="small" style="margin-top:8px">' + escapeHtml(log.notes || "") + '</p></div>';
  }

  function renderMocks() {
    const edit = state.mocks.find(function (mock) { return mock.id === ui.editMockId; });
    return pageChrome("Mock Tests", "Log scores, wrong questions, weak topics, notes, trend, and recommended practice.", '<button class="btn" data-action="weak-quiz">Generate Weak Area Practice</button>') +
      '<section class="split-layout"><article class="card lux-card"><h3 class="card-title">' + (edit ? "Edit Mock" : "Add Mock Test") + '</h3><div class="form-grid" style="margin-top:12px">' +
      '<label>Mock name<input id="mockName" value="' + escapeHtml(edit ? edit.name : "") + '" placeholder="e.g. Full Mock 04"></label>' +
      '<label>Date<input id="mockDate" type="date" value="' + escapeHtml(edit ? edit.date : todayKey()) + '"></label>' +
      '<label>Score out of 100<input id="mockScore" type="number" min="0" max="100" value="' + escapeHtml(edit ? edit.score : "") + '"></label>' +
      '<label>Wrong questions<input id="mockWrong" type="number" min="0" value="' + escapeHtml(edit ? edit.wrong : "") + '"></label>' +
      '<label class="wide">Weak topics<input id="mockWeak" value="' + escapeHtml(edit ? (edit.weakTopics || []).join(", ") : "") + '" placeholder="Comma separated weak topics"></label>' +
      '<label class="wide">Notes<textarea id="mockNotes" placeholder="Analysis and next action">' + escapeHtml(edit ? edit.notes : "") + '</textarea></label>' +
      '</div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="save-mock">' + (edit ? "Save mock" : "Add mock") + '</button>' + (edit ? '<button class="btn secondary" data-action="cancel-edit-mock">Cancel edit</button>' : '') + '</div></article>' +
      '<aside class="grid"><article class="card"><h3 class="card-title">Trend</h3>' + renderMockTrend() + '</article><article class="card"><h3 class="card-title">Saved Mocks</h3><div class="list scroll-list" style="margin-top:12px">' + (state.mocks.length ? state.mocks.slice().reverse().map(renderMockItem).join("") : '<div class="empty">No mocks logged.</div>') + '</div></article></aside></section>';
  }

  function renderMockItem(mock) {
    return '<div class="mock-item"><div class="item-head"><div><strong>' + escapeHtml(mock.name) + '</strong><p class="small">' + formatDate(mock.date) + ' - Score ' + mock.score + '/100 - Wrong ' + mock.wrong + '</p></div><div class="action-row"><button class="icon-btn" data-action="edit-mock" data-id="' + mock.id + '">Edit</button><button class="icon-btn" data-action="delete-mock" data-id="' + mock.id + '">Del</button></div></div><div class="pill-row" style="margin-top:8px">' + (mock.weakTopics || []).map(function (topic) { return '<span class="badge red">' + escapeHtml(topic) + '</span>'; }).join("") + '</div><p class="small" style="margin-top:8px">' + escapeHtml(mock.notes || "") + '</p></div>';
  }

  function renderHabits() {
    const date = todayKey();
    const habit = state.habits[date] || { checks: {}, journal: "" };
    const checks = [
      ["running", "Running done"],
      ["study", "Study done"],
      ["mcqs", "MCQs done"],
      ["current", "Current affairs done"],
      ["punjabi", "Punjabi revision done"],
      ["night", "Night revision done"],
      ["phone", "Phone controlled"],
      ["sleep", "Sleep on time"]
    ];
    const done = checks.filter(function (item) { return habit.checks[item[0]]; }).length;
    return pageChrome("Habits / Journal", "Daily checklist, journal, local save, and streak tracking.", '<button class="btn secondary" data-view="progress">View Streaks</button>') +
      '<section class="split-layout"><article class="card lux-card"><div class="card-head"><div><h3 class="card-title">Daily Habit Checklist</h3><p class="card-kicker">' + formatDate(date) + '</p></div><span class="badge gold">' + done + '/8</span></div><div class="grid two" style="margin-top:14px">' +
      checks.map(function (item) {
        const active = !!habit.checks[item[0]];
        return '<button class="task-item" data-action="toggle-habit" data-key="' + item[0] + '" style="text-align:left;color:var(--text);background:' + (active ? 'rgba(45,227,139,.13)' : 'rgba(255,255,255,.04)') + '"><div class="task-row"><span class="checkbox ' + (active ? "done" : "") + '">' + (active ? "✓" : "") + '</span><strong>' + item[1] + '</strong></div></button>';
      }).join("") + '</div></article><aside class="card"><h3 class="card-title">Daily Journal</h3><textarea id="journalText" placeholder="Wins, mistakes, tomorrow focus">' + escapeHtml(habit.journal || "") + '</textarea><div class="action-row" style="margin-top:12px"><button class="btn" data-action="save-journal">Save journal</button><button class="btn secondary" data-action="generate-revision-quiz">Generate Revision Quiz</button></div><div class="safe-note" style="margin-top:14px">Current study streak: ' + getStudyStreak().current + ' days. Best streak: ' + getStudyStreak().best + ' days.</div></aside></section>';
  }

  function renderPapers() {
    const query = ui.paperQuery.trim().toLowerCase();
    const papers = DATA.previousPapers.filter(function (paper) {
      return !query || [paper.title, paper.year, paper.sourceName, paper.sourceType, paper.topics.join(" ")].join(" ").toLowerCase().includes(query);
    });
    return pageChrome("Previous Year Papers", "Year-wise public listings and clearly labeled practice papers. The app never labels practice content as official.", '<button class="btn secondary" data-view="materials">Study Materials</button><button class="btn" data-action="full-syllabus-quiz">Full Mock Based on Syllabus</button>') +
      '<section class="content-layout"><aside class="card"><h3 class="card-title">Paper Search</h3><label style="margin-top:12px">Search by year, subject, type<input id="paperSearchInput" value="' + escapeHtml(ui.paperQuery) + '" placeholder="2023, Punjabi, official, practice"></label><div class="action-row" style="margin-top:12px"><button class="btn" data-action="run-paper-search">Search</button><button class="btn secondary" data-action="clear-paper-search">Clear</button></div><div class="safe-note" style="margin-top:14px">Official papers are linked only when the source can be verified. Pattern papers are clearly marked as practice.</div></aside><div class="grid">' +
      papers.map(renderPaperCard).join("") + '</div></section>';
  }

  function renderPaperCard(paper) {
    const saved = state.paperBookmarks.includes(paper.id);
    const done = state.paperCompleted.includes(paper.id);
    return '<article class="paper-item"><div class="item-head"><div><div class="pill-row"><span class="badge gold">' + escapeHtml(paper.year) + '</span><span class="badge ' + (paper.official ? "green" : "blue") + '">' + escapeHtml(paper.sourceType) + '</span></div><h3 class="card-title" style="margin-top:10px">' + escapeHtml(paper.title) + '</h3><p class="small">' + escapeHtml(paper.sourceName) + '</p></div></div><p class="small" style="margin-top:10px">' + escapeHtml(paper.description) + '</p><div class="pill-row" style="margin-top:10px">' + paper.topics.slice(0, 6).map(function (topic) { return '<span class="badge">' + escapeHtml(topic) + '</span>'; }).join("") + '</div><div class="action-row" style="margin-top:12px"><button class="btn secondary" data-action="open-paper" data-id="' + paper.id + '">Open paper</button><button class="btn secondary" data-action="open-answer-key" data-id="' + paper.id + '">Answer key</button><button class="btn" data-action="practice-paper" data-id="' + paper.id + '">' + escapeHtml(paper.practiceLabel) + '</button><button class="btn secondary" data-action="bookmark-paper" data-id="' + paper.id + '">' + (saved ? "Bookmarked" : "Bookmark") + '</button><button class="btn secondary" data-action="complete-paper" data-id="' + paper.id + '">' + (done ? "Completed" : "Mark completed") + '</button></div></article>';
  }

  function renderSettings() {
    return pageChrome("Settings / Backup", "Edit exam date, user name, schedule defaults, export/import backup JSON, and reset selected data.", '<button class="btn secondary" data-action="export-backup">Export Backup JSON</button>') +
      '<section class="split-layout"><article class="card lux-card"><h3 class="card-title">Profile & Exam</h3><div class="form-grid" style="margin-top:12px"><label>User name<input id="settingsName" value="' + escapeHtml(state.userName) + '"></label><label>Exam date<input id="settingsExamDate" type="date" value="' + escapeHtml(state.examDate) + '"></label></div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="save-settings">Save settings</button><button class="btn secondary" data-action="restore-default-schedule">Restore default schedule</button></div></article>' +
      '<aside class="grid"><article class="card"><h3 class="card-title">Backup</h3><textarea id="backupText" placeholder="Paste backup JSON here"></textarea><label style="margin-top:12px">Import backup file<input type="file" id="backupFile" accept="application/json,.json"></label><div class="action-row" style="margin-top:12px"><button class="btn" data-action="import-backup">Import backup JSON</button><button class="btn secondary" data-action="export-backup">Export backup JSON</button></div></article>' +
      '<article class="card"><h3 class="card-title">Reset Controls</h3><div class="action-row" style="margin-top:12px"><button class="btn danger" data-action="clear-quiz-history">Clear quiz history</button><button class="btn danger" data-action="clear-study-logs">Clear study logs</button><button class="btn danger" data-action="reset-data">Reset all data</button></div></article></aside></section>';
  }

  function render() {
    renderNav();
    if (!DATA || !DATA.questionBank) {
      viewEl.innerHTML = '<div class="empty">Data failed to load. Please refresh.</div>';
      return;
    }
    if (currentView !== "mcq") stopTimerIfNoQuiz();
    const views = {
      home: renderHome,
      schedule: renderSchedule,
      tasks: renderTasks,
      mcq: renderMCQ,
      materials: renderMaterials,
      content: renderContentLibrary,
      reader: renderReader,
      progress: renderProgress,
      log: renderStudyLog,
      mocks: renderMocks,
      habits: renderHabits,
      papers: renderPapers,
      settings: renderSettings
    };
    viewEl.innerHTML = (views[currentView] || renderHome)();
  }

  function stopTimerIfNoQuiz() {
    if (timerHandle && (!state.activeQuiz || !state.activeQuiz.timed)) {
      window.clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function navigate(view) {
    currentView = view;
    if (view !== "reader") ui.activeResourceId = ui.activeResourceId || "";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startQuizFromTopics(topics, mode, title) {
    const modeMap = {
      quick: [10, false, "Quick 10"],
      practice: [25, false, "Practice 25"],
      timed: [50, true, "Timed 50"],
      full: [100, true, "Full Mock 100"]
    };
    const config = modeMap[mode || ui.quizMode] || modeMap.quick;
    const questions = selectQuestions(topics, config[0]);
    state.activeQuiz = {
      id: uid("quiz"),
      title: title || config[2],
      topics: topics || [],
      questions,
      answers: {},
      index: 0,
      startedAt: Date.now(),
      timed: config[1],
      endsAt: config[1] ? Date.now() + config[0] * 60 * 1000 : 0,
      submitted: false
    };
    saveState();
    currentView = "mcq";
    startTimer();
    render();
  }

  function selectQuestions(topics, count) {
    const normalized = (topics || []).map(function (topic) { return String(topic).toLowerCase(); });
    let pool = DATA.questionBank.filter(function (q) {
      const hay = [q.topic, q.subject].join(" ").toLowerCase();
      return normalized.length && normalized.some(function (topic) { return hay.includes(topic) || topic.includes(q.topic.toLowerCase()); });
    });
    if (pool.length < count) {
      const extra = DATA.questionBank.filter(function (q) { return !pool.includes(q); });
      pool = pool.concat(extra);
    }
    pool = shuffle(pool);
    const selected = [];
    let cursor = 0;
    while (selected.length < count && pool.length) {
      const base = pool[cursor % pool.length];
      selected.push(cursor < pool.length ? base : { ...base, id: base.id + "-r" + cursor });
      cursor += 1;
    }
    return selected;
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function startTimer() {
    if (timerHandle) window.clearInterval(timerHandle);
    if (!state.activeQuiz || !state.activeQuiz.timed || state.activeQuiz.submitted) return;
    timerHandle = window.setInterval(function () {
      if (!state.activeQuiz || state.activeQuiz.submitted) {
        window.clearInterval(timerHandle);
        timerHandle = null;
        return;
      }
      if (Date.now() >= state.activeQuiz.endsAt) {
        submitQuiz(true);
        toast("Time is up. Quiz submitted.");
      } else if (currentView === "mcq") {
        render();
      }
    }, 1000);
  }

  function submitQuiz(auto) {
    const quiz = state.activeQuiz;
    if (!quiz || quiz.submitted) return;
    quiz.submitted = true;
    quiz.submittedAt = Date.now();
    const correct = quiz.questions.filter(function (q) { return quiz.answers[q.id] === q.answer; }).length;
    const wrongQuestions = quiz.questions.filter(function (q) { return quiz.answers[q.id] !== q.answer; });
    wrongQuestions.forEach(function (q) {
      const key = q.subject + "|" + q.topic;
      state.weakTopics[key] = (state.weakTopics[key] || 0) + 1;
    });
    state.quizHistory.push({
      id: quiz.id,
      date: todayKey(),
      title: quiz.title,
      topics: quiz.topics,
      total: quiz.questions.length,
      correct,
      wrong: wrongQuestions.length,
      questions: quiz.questions.map(function (q) {
        return {
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          stem: q.stem,
          options: q.options,
          answer: q.answer,
          selected: quiz.answers[q.id],
          explanation: q.explanation
        };
      })
    });
    saveState();
    if (timerHandle) {
      window.clearInterval(timerHandle);
      timerHandle = null;
    }
    if (!auto) toast("Quiz submitted and progress updated.");
    render();
  }

  function addTopicsFromResource(res) {
    const known = new Set(allTopicNames());
    return (res.tags || []).filter(function (tag) { return known.has(tag); });
  }

  function markResourceCompleted(id, studied) {
    if (!state.materials.completed.includes(id)) state.materials.completed.push(id);
    if (!state.materials.opened.includes(id)) state.materials.opened.push(id);
    const res = DATA.materialResources.find(function (item) { return item.id === id; });
    const topics = res ? addTopicsFromResource(res) : [];
    if (studied && res && topics.length) {
      state.studyLogs.push({
        id: uid("log"),
        date: todayKey(),
        subject: getSubject(res.subject).name,
        topics,
        hours: 0.5,
        mcqs: 0,
        notes: "Marked material studied: " + res.title
      });
    }
    saveState();
  }

  function handleClick(event) {
    const target = event.target.closest("button, a");
    if (!target) return;
    const view = target.dataset.view;
    if (view) {
      event.preventDefault();
      navigate(view);
      return;
    }
    const action = target.dataset.action;
    if (!action) return;
    event.preventDefault();
    dispatchAction(action, target);
  }

  function dispatchAction(action, target) {
    const id = target.dataset.id;
    const date = todayKey();
    const tasks = getTodayTasks();
    switch (action) {
      case "toggle-schedule-edit":
        ui.scheduleEditing = !ui.scheduleEditing;
        render();
        break;
      case "save-schedule":
        saveScheduleFromDom();
        break;
      case "add-schedule-block":
        state.schedule.push({ id: uid("custom"), title: "Custom Block", start: "18:00", end: "19:00", category: "Custom", color: "#55c7ff", description: "Custom routine block." });
        ui.scheduleEditing = true;
        saveState();
        render();
        break;
      case "delete-schedule-block":
        state.schedule = state.schedule.filter(function (block) { return block.id !== id; });
        saveState();
        render();
        break;
      case "schedule-focus":
        toast("Focus started: " + (target.dataset.title || "Schedule block"));
        break;
      case "select-task-phase":
        ui.selectedTaskPhase = target.dataset.phase;
        render();
        break;
      case "regenerate-tasks":
        state.tasksByDate[date] = DATA.phaseTasks[target.dataset.phase].map(function (item, index) {
          return { id: uid("task" + index), title: item[0], detail: item[1], subject: item[2], topics: item[3], phase: target.dataset.phase, done: false, custom: false };
        });
        saveState();
        render();
        toast("Tasks loaded for " + phaseLabel(target.dataset.phase) + ".");
        break;
      case "add-phase-tasks":
        DATA.phaseTasks[target.dataset.phase].forEach(function (item, index) {
          tasks.push({ id: uid("task" + index), title: item[0], detail: item[1], subject: item[2], topics: item[3], phase: target.dataset.phase, done: false, custom: false });
        });
        saveState();
        render();
        break;
      case "toggle-task":
        toggleTask(id);
        break;
      case "add-custom-task":
        addCustomTask();
        break;
      case "edit-task":
        openTaskEditor(id);
        break;
      case "save-task-edit":
        saveTaskEdit(id);
        break;
      case "delete-task":
        state.tasksByDate[date] = tasks.filter(function (task) { return task.id !== id; });
        saveState();
        render();
        break;
      case "clear-completed-tasks":
        state.tasksByDate[date] = tasks.filter(function (task) { return !task.done; });
        saveState();
        render();
        break;
      case "generate-today-quiz":
        startQuizFromTopics(getSelectedTopicsFallback(), "quick", "Quiz From Today's Study");
        break;
      case "toggle-topic":
        toggleSelectedTopic(target.dataset.topic);
        break;
      case "set-quiz-mode":
        ui.quizMode = target.dataset.mode;
        render();
        break;
      case "start-quiz":
        startQuizFromTopics(ui.selectedTopics.length ? ui.selectedTopics : getSelectedTopicsFallback(), ui.quizMode);
        break;
      case "quiz-topic":
        startQuizFromTopics([target.dataset.topic], "quick", target.dataset.topic + " Practice");
        break;
      case "weak-quiz":
        startQuizFromTopics(topWeakTopics(12).map(function (item) { return item.topic; }), "practice", "Weak Area Quiz");
        break;
      case "generate-revision-quiz":
        startQuizFromTopics(getSelectedTopicsFallback().concat(topWeakTopics(6).map(function (item) { return item.topic; })), "practice", "Revision Quiz");
        break;
      case "full-syllabus-quiz":
        startQuizFromTopics(allTopicNames(), "full", "Full Mock Based on Syllabus");
        break;
      case "answer-question":
        if (state.activeQuiz && !state.activeQuiz.submitted) {
          state.activeQuiz.answers[id] = Number(target.dataset.option);
          saveState();
          render();
        }
        break;
      case "prev-question":
        state.activeQuiz.index = Math.max(0, state.activeQuiz.index - 1);
        saveState();
        render();
        break;
      case "next-question":
        state.activeQuiz.index = Math.min(state.activeQuiz.questions.length - 1, state.activeQuiz.index + 1);
        saveState();
        render();
        break;
      case "submit-quiz":
        submitQuiz(false);
        break;
      case "restart-quiz":
        if (state.activeQuiz) startQuizFromTopics(state.activeQuiz.topics, ui.quizMode, state.activeQuiz.title);
        break;
      case "review-mistakes":
      case "review-incorrect-current":
        startMistakeReview();
        break;
      case "run-material-search":
        ui.materialQuery = document.getElementById("materialSearchInput").value.trim();
        render();
        break;
      case "clear-material-search":
        ui.materialQuery = "";
        ui.materialFilter = "All";
        ui.contentOfficialOnly = false;
        ui.contentSavedOnly = false;
        ui.contentCompletedOnly = false;
        render();
        break;
      case "set-material-filter":
        ui.materialFilter = target.dataset.filter;
        render();
        break;
      case "toggle-official-only":
        ui.contentOfficialOnly = !ui.contentOfficialOnly;
        render();
        break;
      case "toggle-saved-only":
        ui.contentSavedOnly = !ui.contentSavedOnly;
        render();
        break;
      case "toggle-completed-only":
        ui.contentCompletedOnly = !ui.contentCompletedOnly;
        render();
        break;
      case "open-resource":
        openResource(id);
        break;
      case "open-original":
        openOriginalResource(id);
        break;
      case "bookmark-resource":
        toggleArray(state.materials.bookmarked, id);
        saveState();
        render();
        break;
      case "complete-resource":
        markResourceCompleted(id, true);
        render();
        toast("Material marked as studied.");
        break;
      case "revision-resource":
        toggleArray(state.materials.revision, id);
        saveState();
        render();
        break;
      case "quiz-resource":
        quizFromResource(id);
        break;
      case "copy-key-points":
        copyKeyPoints(id);
        break;
      case "save-resource-notes":
        state.materials.notes[id] = document.getElementById("resourceNotes").value;
        saveState();
        toast("Notes saved.");
        break;
      case "refresh-content":
        toast("Content library refreshed from local curated data. Add future links in data.js.");
        break;
      case "toggle-log-topic":
        target.classList.toggle("active");
        break;
      case "save-study-log":
        saveStudyLog();
        break;
      case "edit-log":
        ui.editLogId = id;
        const editLog = state.studyLogs.find(function (log) { return log.id === id; });
        ui.selectedSubjectForLog = editLog ? editLog.subject : ui.selectedSubjectForLog;
        render();
        break;
      case "cancel-edit-log":
        ui.editLogId = "";
        render();
        break;
      case "delete-log":
        state.studyLogs = state.studyLogs.filter(function (log) { return log.id !== id; });
        saveState();
        render();
        break;
      case "save-mock":
        saveMock();
        break;
      case "edit-mock":
        ui.editMockId = id;
        render();
        break;
      case "cancel-edit-mock":
        ui.editMockId = "";
        render();
        break;
      case "delete-mock":
        state.mocks = state.mocks.filter(function (mock) { return mock.id !== id; });
        saveState();
        render();
        break;
      case "toggle-habit":
        toggleHabit(target.dataset.key);
        break;
      case "save-journal":
        ensureHabit().journal = document.getElementById("journalText").value;
        saveState();
        toast("Journal saved.");
        break;
      case "run-paper-search":
        ui.paperQuery = document.getElementById("paperSearchInput").value.trim();
        render();
        break;
      case "clear-paper-search":
        ui.paperQuery = "";
        render();
        break;
      case "open-paper":
        openPaper(id);
        break;
      case "open-answer-key":
        openAnswerKey(id);
        break;
      case "practice-paper":
        practicePaper(id);
        break;
      case "bookmark-paper":
        toggleArray(state.paperBookmarks, id);
        saveState();
        render();
        break;
      case "complete-paper":
        toggleArray(state.paperCompleted, id);
        saveState();
        render();
        break;
      case "save-settings":
        state.userName = document.getElementById("settingsName").value.trim() || "Aman";
        state.examDate = document.getElementById("settingsExamDate").value || "2026-05-31";
        saveState();
        render();
        toast("Settings saved.");
        break;
      case "restore-default-schedule":
        state.schedule = clone(DATA.defaultSchedule);
        saveState();
        render();
        toast("Default schedule restored.");
        break;
      case "export-backup":
        exportBackup();
        break;
      case "import-backup":
        importBackup(document.getElementById("backupText") ? document.getElementById("backupText").value : "");
        break;
      case "clear-quiz-history":
        if (window.confirm("Clear only quiz history and weak-topic data?")) {
          state.quizHistory = [];
          state.weakTopics = {};
          delete state.activeQuiz;
          saveState();
          render();
        }
        break;
      case "clear-study-logs":
        if (window.confirm("Clear only study logs?")) {
          state.studyLogs = [];
          saveState();
          render();
        }
        break;
      case "reset-data":
        if (window.confirm("Reset all CrackTrack local data?")) {
          localStorage.removeItem(STORAGE_KEY);
          state = loadState();
          render();
        }
        break;
      default:
        toast("Action completed.");
    }
  }

  function saveScheduleFromDom() {
    document.querySelectorAll(".schedule-field").forEach(function (field) {
      const index = Number(field.dataset.index);
      const key = field.dataset.field;
      if (state.schedule[index]) state.schedule[index][key] = field.value;
    });
    if (state.autoArrange) {
      state.schedule.sort(function (a, b) { return a.start.localeCompare(b.start); });
    }
    saveState();
    ui.scheduleEditing = false;
    render();
    toast("Schedule saved.");
  }

  function toggleTask(id) {
    const task = getTodayTasks().find(function (item) { return item.id === id; });
    if (task) {
      task.done = !task.done;
      saveState();
      render();
    }
  }

  function addCustomTask() {
    const title = document.getElementById("customTaskTitle").value.trim();
    const detail = document.getElementById("customTaskDetail").value.trim();
    const subject = document.getElementById("customTaskSubject").value;
    const topics = document.getElementById("customTaskTopics").value.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
    if (!title) return toast("Add a task title first.");
    getTodayTasks().push({ id: uid("task"), title, detail, subject, topics, phase: "custom", done: false, custom: true });
    saveState();
    render();
  }

  function openTaskEditor(id) {
    const task = getTodayTasks().find(function (item) { return item.id === id; });
    if (!task) return;
    openModal('<div class="card-head"><div><h3 class="card-title">Edit Task</h3><p class="card-kicker">' + escapeHtml(task.subject || "Study") + '</p></div><button class="icon-btn" data-action="close-modal">Close</button></div>' +
      '<div class="form-grid" style="margin-top:12px"><label>Title<input id="editTaskTitle" value="' + escapeHtml(task.title) + '"></label><label>Subject<input id="editTaskSubject" value="' + escapeHtml(task.subject || "") + '"></label><label class="wide">Details<textarea id="editTaskDetail">' + escapeHtml(task.detail || "") + '</textarea></label><label class="wide">Topics<input id="editTaskTopics" value="' + escapeHtml((task.topics || []).join(", ")) + '"></label></div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="save-task-edit" data-id="' + id + '">Save task</button><button class="btn secondary" data-action="close-modal">Cancel</button></div>');
  }

  function saveTaskEdit(id) {
    const task = getTodayTasks().find(function (item) { return item.id === id; });
    if (!task) return;
    task.title = document.getElementById("editTaskTitle").value.trim() || task.title;
    task.subject = document.getElementById("editTaskSubject").value.trim() || task.subject;
    task.detail = document.getElementById("editTaskDetail").value.trim();
    task.topics = document.getElementById("editTaskTopics").value.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
    closeModal();
    saveState();
    render();
  }

  function toggleSelectedTopic(topic) {
    toggleArray(ui.selectedTopics, topic);
    render();
  }

  function toggleArray(arr, value) {
    const index = arr.indexOf(value);
    if (index >= 0) arr.splice(index, 1);
    else arr.push(value);
  }

  function startMistakeReview() {
    const wrong = state.quizHistory.flatMap(function (quiz) {
      return (quiz.questions || []).filter(function (q) { return q.selected !== q.answer; });
    });
    if (!wrong.length) return toast("No mistakes saved yet.");
    const questions = wrong.slice(-25).map(function (q, index) {
      return {
        id: "mistake-" + index + "-" + q.id,
        subject: q.subject,
        topic: q.topic,
        stem: q.stem,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation
      };
    });
    state.activeQuiz = { id: uid("mistakes"), title: "Mistake Review", topics: questions.map(function (q) { return q.topic; }), questions, answers: {}, index: 0, startedAt: Date.now(), timed: false, endsAt: 0, submitted: false };
    saveState();
    currentView = "mcq";
    render();
  }

  function openResource(id) {
    const res = DATA.materialResources.find(function (item) { return item.id === id; });
    if (!res) return;
    if (!state.materials.opened.includes(id)) state.materials.opened.push(id);
    ui.activeResourceId = id;
    saveState();
    navigate("reader");
  }

  function openOriginalResource(id) {
    const res = DATA.materialResources.find(function (item) { return item.id === id; });
    if (!res || !res.url) {
      ui.activeResourceId = id;
      currentView = "reader";
      render();
      toast("This is an internal note, opened inside CrackTrack.");
      return;
    }
    window.open(res.url, "_blank", "noopener");
  }

  function quizFromResource(id) {
    const res = DATA.materialResources.find(function (item) { return item.id === id; });
    if (!res) return;
    markResourceCompleted(id, false);
    const topics = addTopicsFromResource(res);
    startQuizFromTopics(topics.length ? topics : (res.tags || [res.topic]), "quick", "Quiz From " + res.title);
  }

  function copyKeyPoints(id) {
    const res = DATA.materialResources.find(function (item) { return item.id === id; });
    if (!res) return;
    const text = res.title + "\n" + (res.keyPoints || []).map(function (point) { return "- " + point; }).join("\n") + (res.url ? "\nSource: " + res.url : "");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Key points copied."); }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    openModal('<h3 class="card-title">Copy Key Points</h3><textarea readonly>' + escapeHtml(text) + '</textarea><div class="action-row" style="margin-top:12px"><button class="btn secondary" data-action="close-modal">Close</button></div>');
  }

  function saveStudyLog() {
    const subject = document.getElementById("logSubject").value;
    const selectedTopics = Array.from(document.querySelectorAll("#topicSelect .topic-chip.active")).map(function (btn) { return btn.dataset.topic; });
    const log = {
      id: ui.editLogId || uid("log"),
      date: document.getElementById("logDate").value || todayKey(),
      subject,
      topics: selectedTopics,
      hours: Number(document.getElementById("logHours").value || 0),
      mcqs: Number(document.getElementById("logMcqs").value || 0),
      notes: document.getElementById("logNotes").value.trim()
    };
    if (!log.topics.length) return toast("Select at least one studied topic.");
    if (ui.editLogId) {
      state.studyLogs = state.studyLogs.map(function (item) { return item.id === ui.editLogId ? log : item; });
      ui.editLogId = "";
    } else {
      state.studyLogs.push(log);
    }
    ui.selectedSubjectForLog = subject;
    saveState();
    render();
    toast("Study log saved. MCQ topics updated.");
  }

  function saveMock() {
    const weakTopics = document.getElementById("mockWeak").value.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
    const mock = {
      id: ui.editMockId || uid("mock"),
      name: document.getElementById("mockName").value.trim() || "Mock Test",
      date: document.getElementById("mockDate").value || todayKey(),
      score: clamp(Number(document.getElementById("mockScore").value || 0), 0, 100),
      wrong: Number(document.getElementById("mockWrong").value || 0),
      weakTopics,
      notes: document.getElementById("mockNotes").value.trim()
    };
    weakTopics.forEach(function (topic) {
      const key = "Mock|" + topic;
      state.weakTopics[key] = (state.weakTopics[key] || 0) + 1;
    });
    if (ui.editMockId) {
      state.mocks = state.mocks.map(function (item) { return item.id === ui.editMockId ? mock : item; });
      ui.editMockId = "";
    } else {
      state.mocks.push(mock);
    }
    saveState();
    render();
    toast("Mock saved and trend updated.");
  }

  function ensureHabit() {
    const date = todayKey();
    if (!state.habits[date]) state.habits[date] = { checks: {}, journal: "" };
    if (!state.habits[date].checks) state.habits[date].checks = {};
    return state.habits[date];
  }

  function toggleHabit(key) {
    const habit = ensureHabit();
    habit.checks[key] = !habit.checks[key];
    saveState();
    render();
  }

  function openPaper(id) {
    const paper = DATA.previousPapers.find(function (item) { return item.id === id; });
    if (!paper) return;
    if (paper.url) window.open(paper.url, "_blank", "noopener");
    else {
      openModal('<h3 class="card-title">' + escapeHtml(paper.title) + '</h3><p class="small">' + escapeHtml(paper.description) + '</p><div class="pill-row" style="margin-top:12px">' + paper.topics.map(function (topic) { return '<span class="badge">' + escapeHtml(topic) + '</span>'; }).join("") + '</div><div class="action-row" style="margin-top:12px"><button class="btn" data-action="practice-paper" data-id="' + paper.id + '">Practice as quiz</button><button class="btn secondary" data-action="close-modal">Close</button></div>');
    }
  }

  function openAnswerKey(id) {
    const paper = DATA.previousPapers.find(function (item) { return item.id === id; });
    if (paper && paper.answerKeyUrl) window.open(paper.answerKeyUrl, "_blank", "noopener");
    else toast("Answer key is not available from a verified public source for this entry.");
  }

  function practicePaper(id) {
    const paper = DATA.previousPapers.find(function (item) { return item.id === id; });
    if (!paper) return;
    if (!state.paperCompleted.includes(id)) state.paperCompleted.push(id);
    saveState();
    startQuizFromTopics(paper.topics, paper.id.includes("part-b") ? "full" : "practice", paper.title);
  }

  function exportBackup() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), app: "CrackTrack", state }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cracktrack-backup-" + todayKey() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    const backupText = document.getElementById("backupText");
    if (backupText) backupText.value = payload;
    toast("Backup exported.");
  }

  function importBackup(text) {
    try {
      const parsed = JSON.parse(text || "{}");
      const incoming = parsed.state || parsed;
      if (!incoming || typeof incoming !== "object") throw new Error("Invalid backup");
      state = {
        ...loadState(),
        ...incoming,
        materials: {
          ...loadState().materials,
          ...(incoming.materials || {})
        }
      };
      saveState();
      render();
      toast("Backup imported.");
    } catch (error) {
      toast("Import failed: invalid JSON backup.");
    }
  }

  document.addEventListener("click", function (event) {
    const close = event.target.closest('[data-action="close-modal"]');
    if (close) {
      event.preventDefault();
      closeModal();
      return;
    }
    handleClick(event);
  });

  document.addEventListener("change", function (event) {
    if (event.target.id === "autoArrangeToggle") {
      state.autoArrange = event.target.checked;
      saveState();
      toast("Auto Arrange " + (state.autoArrange ? "enabled" : "disabled") + ".");
    }
    if (event.target.id === "logSubject") {
      ui.selectedSubjectForLog = event.target.value;
      render();
    }
    if (event.target.id === "backupFile" && event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function () {
        const box = document.getElementById("backupText");
        if (box) box.value = String(reader.result || "");
      };
      reader.readAsText(event.target.files[0]);
    }
  });

  window.addEventListener("beforeunload", saveState);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function (error) {
        console.warn("Service worker registration failed", error);
      });
    });
  }

  ensureTodayTasks();
  if (state.activeQuiz && state.activeQuiz.timed && !state.activeQuiz.submitted) startTimer();
  render();
})();
