export type AccentTone = "blue" | "purple" | "green" | "amber";

export type ModuleId = 1 | 2 | 3 | 4;

export type SessionStatus = "published" | "upcoming";

export type SessionState = "completed" | "current" | "available" | "locked";

export type CourseModule = {
  id: ModuleId;
  title: string;
  episodeRange: string;
  tagline: string;
  color: string;
  accent: AccentTone;
  unlockAfter?: string;
};

export type CourseSession = {
  id: string;
  slug: string;
  title: string;
  module: ModuleId;
  moduleName?: string;
  sessionNumber?: number;
  duration?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  nextSession?: string;
  prevSession?: string | null;
  prevRecap: string;
  dependsOn: string[];
  leadsTo: string[];
  youtubeId?: string;
  status: SessionStatus;
};

export type OutlineItem = {
  label: string;
  title: string;
  description: string;
  accent: AccentTone;
};

export type ConceptCard = {
  category: string;
  title: string;
  description: string;
  placeholderTitle: string;
  placeholderItems: string[];
  takeaway: string;
  accent: AccentTone;
};

export type ProgressSummary = {
  completedCount: number;
  totalCount: number;
  currentModule: ModuleId;
  currentModuleCompleted: number;
  currentModuleTotal: number;
  currentSessionId: string;
};
