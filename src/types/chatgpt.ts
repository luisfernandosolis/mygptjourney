// Raw ChatGPT export types
export interface RawConversation {
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, RawMessage>;
  conversation_id?: string;
  default_model_slug?: string;
}

export interface RawMessage {
  id: string;
  message?: {
    id: string;
    author: {
      role: 'user' | 'assistant' | 'system' | 'tool';
      metadata?: Record<string, unknown>;
    };
    create_time?: number | null;
    content: {
      content_type: string;
      parts?: (string | Record<string, unknown>)[];
    };
    metadata?: {
      model_slug?: string;
      [key: string]: unknown;
    };
  } | null;
  parent?: string;
  children: string[];
}

// Parsed & cleaned types
export interface ParsedConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ParsedMessage[];
  model: string;
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  wordCount: number;
  userWordCount: number;
}

export interface ParsedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date | null;
  model?: string;
  wordCount: number;
}

// Analytics types
export interface AnalyticsResult {
  overview: OverviewStats;
  timePatterns: TimePatterns;
  topTopics: TopicInfo[];
  categories: CategoryInfo[];
  modelUsage: ModelUsage[];
  personality: PersonalityProfile;
  achievements: Achievement[];
  wordCloud: WordCloudItem[];
  moodJourney: MoodPoint[];
  evolution: EvolutionPoint[];
  powerMetrics: PowerMetrics;
  funFacts: FunFact[];
  predictions: string[];
  timeMachine: TimeMachine;
}

export interface OverviewStats {
  totalConversations: number;
  totalMessages: number;
  totalUserMessages: number;
  totalAssistantMessages: number;
  totalWords: number;
  totalUserWords: number;
  avgConversationLength: number;
  avgWordsPerMessage: number;
  longestConversation: { title: string; messageCount: number };
  shortestConversation: { title: string; messageCount: number };
  firstConversation: { title: string; date: Date };
  lastConversation: { title: string; date: Date };
  totalDaysActive: number;
  avgConversationsPerDay: number;
}

export interface TimePatterns {
  hourlyDistribution: number[];
  dailyDistribution: number[];
  monthlyDistribution: { month: string; count: number }[];
  busiestHour: number;
  busiestDay: string;
  busiestDayKey: string;
  busiestMonth: string;
  isNightOwl: boolean;
  peakPeriod: string;
  peakPeriodKey: string;
  weekdayVsWeekend: { weekday: number; weekend: number };
}

export interface TopicInfo {
  topic: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CategoryInfo {
  name: string;
  nameKey: string;
  count: number;
  percentage: number;
  icon: string;
  color: string;
}

export interface ModelUsage {
  model: string;
  count: number;
  percentage: number;
}

export interface PersonalityProfile {
  archetype: string;
  archetypeKey: string;
  archetypeEmoji: string;
  archetypeDescription: string;
  traits: { name: string; nameKey: string; score: number; color: string }[];
  conversationStyle: string;
  styleKey: string;
  funTitle: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

export interface WordCloudItem {
  text: string;
  value: number;
}

export interface MoodPoint {
  date: string;
  sentiment: number;
  label: string;
  labelKey: string;
}

export interface EvolutionPoint {
  period: string;
  topics: string[];
  messageCount: number;
}

export interface PowerMetrics {
  longestStreak: number;
  currentStreak: number;
  mostActiveDay: { date: string; count: number };
  averageResponseTime: string;
  questionsAsked: number;
  codeBlocksGenerated: number;
  friendshipScore: number;
  totalCharacters: number;
  booksEquivalent: number;
}

export interface FunFact {
  emoji: string;
  text: string;
  key?: string;
  params?: Record<string, string | number>;
}

export interface TimeMachine {
  firstConversation: { title: string; date: Date; preview: string };
  latestConversation: { title: string; date: Date; preview: string };
  biggestShift: string;
}

export type JourneyScreen =
  | 'upload'
  | 'loading'
  | 'welcome'
  | 'overview'
  | 'time-patterns'
  | 'topics'
  | 'categories'
  | 'personality'
  | 'achievements'
  | 'word-cloud'
  | 'mood-journey'
  | 'evolution'
  | 'power-metrics'
  | 'time-machine'
  | 'fun-facts'
  | 'summary';
