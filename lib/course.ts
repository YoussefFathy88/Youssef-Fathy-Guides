import type { Route } from "next";

import { courseModules, courseSessions } from "@/data/sessions";
import type {
  ConceptCard,
  CourseModule,
  CourseSession,
  ModuleId,
  OutlineItem,
  ProgressSummary,
  SessionState,
} from "@/lib/session-types";

export function getModules() {
  return courseModules;
}

export function getModuleById(moduleId: ModuleId) {
  return courseModules.find((module) => module.id === moduleId);
}

export function getSessions() {
  return courseSessions;
}

export function getSessionsByModule(moduleId: ModuleId) {
  return courseSessions.filter((session) => session.module === moduleId);
}

export function getSessionById(sessionId: string) {
  return courseSessions.find((session) => session.id === sessionId);
}

export function getSessionBySlug(slug: string) {
  return courseSessions.find((session) => session.slug === slug);
}

export function getSessionRoute(session: Pick<CourseSession, "slug">): Route {
  return `/sessions/${session.slug}` as Route;
}

export function getModuleUnlockDependency(moduleId: ModuleId) {
  return getModuleById(moduleId)?.unlockAfter;
}

export function getPreviousSessionInModule(session: CourseSession) {
  const moduleSessions = getSessionsByModule(session.module);
  const index = moduleSessions.findIndex((item) => item.id === session.id);

  if (index <= 0) {
    return undefined;
  }

  return moduleSessions[index - 1];
}

export function getNextSessionInModule(session: CourseSession) {
  const moduleSessions = getSessionsByModule(session.module);
  const index = moduleSessions.findIndex((item) => item.id === session.id);

  if (index < 0 || index === moduleSessions.length - 1) {
    return undefined;
  }

  return moduleSessions[index + 1];
}

export function getRequiredSessionToUnlock(session: CourseSession) {
  const previousInModule = getPreviousSessionInModule(session);

  if (previousInModule) {
    return previousInModule;
  }

  const moduleGate = getModuleUnlockDependency(session.module);

  if (!moduleGate) {
    return undefined;
  }

  return getSessionById(moduleGate);
}

export function isSessionUnlocked(sessionId: string, completed: Set<string>) {
  if (completed.has(sessionId)) {
    return true;
  }

  const session = getSessionById(sessionId);

  if (!session) {
    return false;
  }

  const required = getRequiredSessionToUnlock(session);

  if (!required) {
    return true;
  }

  return completed.has(required.id);
}

export function getCurrentSessionId(completed: Set<string>) {
  const nextUnlocked = courseSessions.find(
    (session) => !completed.has(session.id) && isSessionUnlocked(session.id, completed),
  );

  return nextUnlocked?.id ?? courseSessions[courseSessions.length - 1]?.id ?? "E01";
}

export function getSessionState(
  session: CourseSession,
  completed: Set<string>,
  currentSessionId: string,
): SessionState {
  if (completed.has(session.id)) {
    return "completed";
  }

  if (session.id === currentSessionId) {
    return "current";
  }

  if (isSessionUnlocked(session.id, completed)) {
    return "available";
  }

  return "locked";
}

export function getProgressSummary(completed: Set<string>): ProgressSummary {
  const currentSessionId = getCurrentSessionId(completed);
  const currentSession = getSessionById(currentSessionId) ?? courseSessions[0];
  const currentModuleSessions = getSessionsByModule(currentSession.module);
  const currentModuleCompleted = currentModuleSessions.filter((session) =>
    completed.has(session.id),
  ).length;

  return {
    completedCount: completed.size,
    totalCount: courseSessions.length,
    currentModule: currentSession.module,
    currentModuleCompleted,
    currentModuleTotal: currentModuleSessions.length,
    currentSessionId,
  };
}

export function getNextAvailableSession(
  currentSessionId: string,
  completed: Set<string>,
) {
  const currentIndex = courseSessions.findIndex((session) => session.id === currentSessionId);
  const afterCurrent = currentIndex >= 0 ? courseSessions.slice(currentIndex + 1) : courseSessions;

  const nextUnlocked = afterCurrent.find(
    (session) => !completed.has(session.id) && isSessionUnlocked(session.id, completed),
  );

  if (nextUnlocked) {
    return nextUnlocked;
  }

  return courseSessions.find(
    (session) => !completed.has(session.id) && isSessionUnlocked(session.id, completed),
  );
}

export function getModuleStateColor(module: CourseModule) {
  return module.color;
}

export function buildSessionOutline(session: CourseSession): OutlineItem[] {
  return [
    {
      label: "Story hook",
      title: "Why this session matters",
      description: `Frame where ${session.title} sits in the larger course story and why it changes the system you are building.`,
      accent: "blue",
    },
    {
      label: "Mental model",
      title: "Core mechanism",
      description: `Break ${session.title} into the key moving parts so the viewer leaves with a concrete internal model instead of a slogan.`,
      accent: "purple",
    },
    {
      label: "System role",
      title: "How it changes the stack",
      description: `Connect this topic to what it unlocks in real GenAI systems, workflows, or agents.`,
      accent: "green",
    },
    {
      label: "Failure mode",
      title: "What goes wrong without it",
      description: `Show the limitation, confusion, or production issue that appears when this concept is missing or misunderstood.`,
      accent: "amber",
    },
    {
      label: "Applied lens",
      title: "Practical example",
      description: `Translate ${session.title} into a concrete scenario the audience can reason about on screen.`,
      accent: "blue",
    },
    {
      label: "Retention",
      title: "Recap",
      description: `Leave the session with a compact summary and a clear bridge into the next concept.`,
      accent: "purple",
    },
  ];
}

export function buildSessionConcepts(session: CourseSession): ConceptCard[] {
  const module = getModuleById(session.module);

  return [
    {
      category: "Core concept",
      title: `${session.title} as a system primitive`,
      description: `Treat ${session.title} as one important layer inside the broader course architecture. The goal is to make the role of this lesson obvious before the implementation details appear.`,
      placeholderTitle: "System map",
      placeholderItems: [session.id, `Module-${session.module}`, "system-view", "concept-map"],
      takeaway: `The viewer should leave knowing exactly where ${session.title} fits inside ${module?.title ?? "the course"}.`,
      accent: "purple",
    },
    {
      category: "Mechanics",
      title: `What changes when ${session.title} is introduced`,
      description: `This block is reserved for the mechanism, interaction, or control surface that makes this lesson operational rather than abstract.`,
      placeholderTitle: "Interaction flow",
      placeholderItems: ["inputs", "transform", "decision", "outputs"],
      takeaway: `Every session should show how one capability changes system behavior, not just define a term.`,
      accent: "green",
    },
    {
      category: "Practical lens",
      title: `${session.title} in a real build`,
      description: `Use this area to connect the theory to a prompt, retrieval step, tool decision, workflow stage, or production tradeoff.`,
      placeholderTitle: "Applied walkthrough",
      placeholderItems: ["observe", "debug", "improve", "ship"],
      takeaway: `The concept should feel like something the viewer can use immediately in an actual GenAI project.`,
      accent: "amber",
    },
  ];
}
