import { format, differenceInDays, eachMonthOfInterval, startOfMonth } from 'date-fns';
import type {
  ParsedConversation,
  AnalyticsResult,
  OverviewStats,
  TimePatterns,
  TopicInfo,
  CategoryInfo,
  ModelUsage,
  PersonalityProfile,
  Achievement,
  MoodPoint,
  EvolutionPoint,
  PowerMetrics,
  FunFact,
  TimeMachine,
} from '../types/chatgpt';
import {
  extractTopics,
  categorizeConversation,
  extractWordFrequencies,
  analyzeSentiment,
  CATEGORY_KEYWORDS,
} from './topicExtraction';

const TOPIC_COLORS = [
  '#6C63FF', '#FF6B9D', '#00D4AA', '#FFB347', '#FF6B6B',
  '#4ECDC4', '#A78BFA', '#F472B6', '#34D399', '#FBBF24',
  '#60A5FA', '#C084FC',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Coding & Development': '💻',
  'Creative Writing': '✍️',
  'Learning & Education': '📚',
  'Business & Career': '💼',
  'Data & Analytics': '📊',
  'Personal & Lifestyle': '🌟',
  'Research & Analysis': '🔬',
  'Design & Creativity': '🎨',
  'General': '💬',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Coding & Development': '#6C63FF',
  'Creative Writing': '#FF6B9D',
  'Learning & Education': '#00D4AA',
  'Business & Career': '#FFB347',
  'Data & Analytics': '#4ECDC4',
  'Personal & Lifestyle': '#F472B6',
  'Research & Analysis': '#60A5FA',
  'Design & Creativity': '#A78BFA',
  'General': '#9CA3AF',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const PEAK_PERIOD_KEYS: Record<string, string> = {
  Morning: 'morning',
  Afternoon: 'afternoon',
  Evening: 'evening',
  Night: 'night',
};
const CATEGORY_NAME_KEYS: Record<string, string> = {
  'Coding & Development': 'coding',
  'Creative Writing': 'creative',
  'Learning & Education': 'learning',
  'Business & Career': 'business',
  'Data & Analytics': 'data',
  'Personal & Lifestyle': 'personal',
  'Research & Analysis': 'research',
  'Design & Creativity': 'design',
  'General': 'general',
};

export function generateAnalytics(conversations: ParsedConversation[]): AnalyticsResult {
  const overview = generateOverview(conversations);
  const timePatterns = generateTimePatterns(conversations);
  const userTexts = conversations.flatMap((c) =>
    c.messages.filter((m) => m.role === 'user').map((m) => m.content)
  );
  const allTitles = conversations.map((c) => c.title);
  const topTopics = generateTopTopics([...allTitles, ...userTexts.slice(0, 2000)]);
  const categories = generateCategories(conversations);
  const modelUsage = generateModelUsage(conversations);
  const personality = generatePersonality(conversations, categories, timePatterns);
  const achievements = generateAchievements(conversations, overview, timePatterns, categories);
  const wordCloud = extractWordFrequencies(userTexts.slice(0, 3000));
  const moodJourney = generateMoodJourney(conversations);
  const evolution = generateEvolution(conversations);
  const powerMetrics = generatePowerMetrics(conversations, overview);
  const funFacts = generateFunFacts(overview, timePatterns, personality, powerMetrics);
  const predictions = generatePredictions(topTopics, categories, personality);
  const timeMachine = generateTimeMachine(conversations);

  return {
    overview,
    timePatterns,
    topTopics,
    categories,
    modelUsage,
    personality,
    achievements,
    wordCloud,
    moodJourney,
    evolution,
    powerMetrics,
    funFacts,
    predictions,
    timeMachine,
  };
}

function generateOverview(conversations: ParsedConversation[]): OverviewStats {
  const totalMessages = conversations.reduce((s, c) => s + c.messageCount, 0);
  const totalUserMessages = conversations.reduce((s, c) => s + c.userMessageCount, 0);
  const totalAssistantMessages = conversations.reduce((s, c) => s + c.assistantMessageCount, 0);
  const totalWords = conversations.reduce((s, c) => s + c.wordCount, 0);
  const totalUserWords = conversations.reduce((s, c) => s + c.userWordCount, 0);

  const sorted = [...conversations].sort((a, b) => b.messageCount - a.messageCount);
  const first = conversations[0];
  const last = conversations[conversations.length - 1];

  const totalDaysActive = first && last
    ? differenceInDays(last.createdAt, first.createdAt) + 1
    : 1;

  return {
    totalConversations: conversations.length,
    totalMessages,
    totalUserMessages,
    totalAssistantMessages,
    totalWords,
    totalUserWords,
    avgConversationLength: Math.round(totalMessages / Math.max(conversations.length, 1)),
    avgWordsPerMessage: Math.round(totalWords / Math.max(totalMessages, 1)),
    longestConversation: {
      title: sorted[0]?.title || 'N/A',
      messageCount: sorted[0]?.messageCount || 0,
    },
    shortestConversation: {
      title: sorted[sorted.length - 1]?.title || 'N/A',
      messageCount: sorted[sorted.length - 1]?.messageCount || 0,
    },
    firstConversation: {
      title: first?.title || 'N/A',
      date: first?.createdAt || new Date(),
    },
    lastConversation: {
      title: last?.title || 'N/A',
      date: last?.createdAt || new Date(),
    },
    totalDaysActive,
    avgConversationsPerDay: parseFloat((conversations.length / Math.max(totalDaysActive, 1)).toFixed(1)),
  };
}

function generateTimePatterns(conversations: ParsedConversation[]): TimePatterns {
  const hourly = new Array(24).fill(0);
  const daily = new Array(7).fill(0);
  const monthlyMap = new Map<string, number>();

  for (const conv of conversations) {
    const d = conv.createdAt;
    hourly[d.getHours()]++;
    daily[d.getDay()]++;
    const monthKey = format(d, 'MMM yyyy');
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
  }

  // Build full monthly range
  const first = conversations[0]?.createdAt;
  const last = conversations[conversations.length - 1]?.createdAt;
  let monthlyDistribution: { month: string; count: number }[] = [];

  if (first && last) {
    const months = eachMonthOfInterval({ start: startOfMonth(first), end: startOfMonth(last) });
    monthlyDistribution = months.map((m) => {
      const key = format(m, 'MMM yyyy');
      return { month: key, count: monthlyMap.get(key) || 0 };
    });
  }

  const busiestHour = hourly.indexOf(Math.max(...hourly));
  const busiestDayIndex = daily.indexOf(Math.max(...daily));
  const busiestMonthEntry = monthlyDistribution.reduce(
    (max, e) => (e.count > max.count ? e : max),
    { month: 'N/A', count: 0 }
  );

  const weekday = daily.slice(1, 6).reduce((a, b) => a + b, 0);
  const weekend = daily[0] + daily[6];

  const nightMessages = hourly.slice(22).reduce((a, b) => a + b, 0) + hourly.slice(0, 6).reduce((a, b) => a + b, 0);
  const dayMessages = hourly.slice(6, 22).reduce((a, b) => a + b, 0);

  let peakPeriod: string;
  if (busiestHour >= 5 && busiestHour < 12) peakPeriod = 'Morning';
  else if (busiestHour >= 12 && busiestHour < 17) peakPeriod = 'Afternoon';
  else if (busiestHour >= 17 && busiestHour < 21) peakPeriod = 'Evening';
  else peakPeriod = 'Night';

  return {
    hourlyDistribution: hourly,
    dailyDistribution: daily,
    monthlyDistribution,
    busiestHour,
    busiestDay: DAY_NAMES[busiestDayIndex],
    busiestDayKey: DAY_KEYS[busiestDayIndex],
    busiestMonth: busiestMonthEntry.month,
    isNightOwl: nightMessages > dayMessages * 0.4,
    peakPeriod,
    peakPeriodKey: PEAK_PERIOD_KEYS[peakPeriod] || 'morning',
    weekdayVsWeekend: { weekday, weekend },
  };
}

function generateTopTopics(texts: string[]): TopicInfo[] {
  const raw = extractTopics(texts);
  const total = raw.reduce((s, t) => s + t.count, 0);

  return raw.map((t, i) => ({
    topic: t.topic,
    count: t.count,
    percentage: Math.round((t.count / Math.max(total, 1)) * 100),
    color: TOPIC_COLORS[i % TOPIC_COLORS.length],
  }));
}

function generateCategories(conversations: ParsedConversation[]): CategoryInfo[] {
  const counts = new Map<string, number>();

  for (const conv of conversations) {
    const combinedText = conv.title + ' ' + conv.messages
      .filter((m) => m.role === 'user')
      .slice(0, 5)
      .map((m) => m.content.slice(0, 200))
      .join(' ');
    const category = categorizeConversation(combinedText);
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  const total = conversations.length;
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      nameKey: CATEGORY_NAME_KEYS[name] || 'general',
      count,
      percentage: Math.round((count / total) * 100),
      icon: CATEGORY_ICONS[name] || '💬',
      color: CATEGORY_COLORS[name] || '#9CA3AF',
    }))
    .sort((a, b) => b.count - a.count);
}

function generateModelUsage(conversations: ParsedConversation[]): ModelUsage[] {
  const counts = new Map<string, number>();

  for (const conv of conversations) {
    const model = formatModelName(conv.model);
    counts.set(model, (counts.get(model) || 0) + 1);
  }

  const total = conversations.length;
  return Array.from(counts.entries())
    .map(([model, count]) => ({
      model,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function formatModelName(slug: string): string {
  const map: Record<string, string> = {
    'gpt-4': 'GPT-4',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gpt-3.5': 'GPT-3.5',
    'text-davinci': 'GPT-3',
    'o1-preview': 'o1 Preview',
    'o1-mini': 'o1 Mini',
    'o1': 'o1',
    'o3-mini': 'o3 Mini',
    'unknown': 'Unknown Model',
  };
  for (const [key, value] of Object.entries(map)) {
    if (slug.includes(key)) return value;
  }
  return slug.toUpperCase();
}

function generatePersonality(
  conversations: ParsedConversation[],
  categories: CategoryInfo[],
  timePatterns: TimePatterns
): PersonalityProfile {
  const topCategory = categories[0]?.name || 'General';
  const avgLength = conversations.reduce((s, c) => s + c.userWordCount, 0) / Math.max(conversations.length, 1);

  // Calculate traits
  const curiosityScore = Math.min(100, Math.round((conversations.length / 100) * 60 + 40));
  const verbosityScore = Math.min(100, Math.round((avgLength / 200) * 100));
  const diversityScore = Math.min(100, Math.round((categories.length / Object.keys(CATEGORY_KEYWORDS).length) * 100));
  const consistencyScore = Math.min(100, Math.round(50 + conversations.length * 0.3));
  const creativityScore = categories.find((c) => c.name === 'Creative Writing')?.percentage || 0;
  const technicalScore = categories.find((c) => c.name === 'Coding & Development')?.percentage || 0;

  // Determine archetype
  const { archetype, archetypeKey, archetypeEmoji, archetypeDescription, funTitle } = determineArchetype(
    topCategory,
    timePatterns,
    verbosityScore,
    curiosityScore,
    technicalScore,
    creativityScore,
    conversations.length
  );

  const style = verbosityScore > 60
    ? 'You tend to give detailed context in your conversations'
    : 'You prefer getting straight to the point';
  const styleKey = verbosityScore > 60 ? 'detailed' : 'concise';

  return {
    archetype,
    archetypeKey,
    archetypeEmoji,
    archetypeDescription,
    traits: [
      { name: 'Curiosity', nameKey: 'curiosity', score: curiosityScore, color: '#6C63FF' },
      { name: 'Verbosity', nameKey: 'verbosity', score: verbosityScore, color: '#FF6B9D' },
      { name: 'Diversity', nameKey: 'diversity', score: diversityScore, color: '#00D4AA' },
      { name: 'Consistency', nameKey: 'consistency', score: consistencyScore, color: '#FFB347' },
      { name: 'Creativity', nameKey: 'creativity', score: Math.max(20, creativityScore * 3), color: '#A78BFA' },
      { name: 'Technical', nameKey: 'technical', score: Math.max(20, technicalScore * 3), color: '#4ECDC4' },
    ],
    conversationStyle: style,
    styleKey,
    funTitle,
  };
}

function determineArchetype(
  topCategory: string,
  timePatterns: TimePatterns,
  verbosity: number,
  curiosity: number,
  technical: number,
  creativity: number,
  totalConvos: number
): { archetype: string; archetypeKey: string; archetypeEmoji: string; archetypeDescription: string; funTitle: string } {
  if (technical > 30 && timePatterns.isNightOwl) {
    return {
      archetype: 'The Midnight Coder',
      archetypeKey: 'midnight_coder',
      archetypeEmoji: '🌙',
      archetypeDescription: 'You burn the midnight oil, crafting code while the world sleeps. Your best ideas come when the stars are out.',
      funTitle: 'Night Owl Developer',
    };
  }
  if (curiosity > 80 && totalConvos > 200) {
    return {
      archetype: 'The Curious Explorer',
      archetypeKey: 'curious_explorer',
      archetypeEmoji: '🧭',
      archetypeDescription: 'Your insatiable curiosity knows no bounds. You explore every corner of knowledge with ChatGPT as your guide.',
      funTitle: 'Knowledge Adventurer',
    };
  }
  if (creativity > 25) {
    return {
      archetype: 'The Creative Genius',
      archetypeKey: 'creative_genius',
      archetypeEmoji: '🎨',
      archetypeDescription: 'Words are your canvas and ChatGPT is your muse. You bring ideas to life through creative expression.',
      funTitle: 'Digital Storyteller',
    };
  }
  if (technical > 20) {
    return {
      archetype: 'The Code Wizard',
      archetypeKey: 'code_wizard',
      archetypeEmoji: '🧙‍♂️',
      archetypeDescription: 'You wield code like magic, turning complex problems into elegant solutions with AI as your spellbook.',
      funTitle: 'Silicon Sorcerer',
    };
  }
  if (verbosity > 70) {
    return {
      archetype: 'The Deep Thinker',
      archetypeKey: 'deep_thinker',
      archetypeEmoji: '🤔',
      archetypeDescription: 'You don\'t just scratch the surface—you dive deep. Your conversations reveal a mind that loves thorough understanding.',
      funTitle: 'Philosophical Mind',
    };
  }
  if (topCategory === 'Business & Career') {
    return {
      archetype: 'The Hustler',
      archetypeKey: 'hustler',
      archetypeEmoji: '🚀',
      archetypeDescription: 'Always building, always growing. You use AI to accelerate your business ambitions and career trajectory.',
      funTitle: 'AI-Powered Entrepreneur',
    };
  }
  if (topCategory === 'Learning & Education') {
    return {
      archetype: 'The Eternal Student',
      archetypeKey: 'eternal_student',
      archetypeEmoji: '📚',
      archetypeDescription: 'Learning is your superpower. You turn ChatGPT into your personal tutor for endless subjects.',
      funTitle: 'Knowledge Seeker',
    };
  }
  return {
    archetype: 'The AI Whisperer',
    archetypeKey: 'ai_whisperer',
    archetypeEmoji: '✨',
    archetypeDescription: 'You have a natural way with AI. Your diverse conversations show someone who truly understands how to get the best from ChatGPT.',
    funTitle: 'Prompt Master',
  };
}

function generateAchievements(
  conversations: ParsedConversation[],
  overview: OverviewStats,
  timePatterns: TimePatterns,
  categories: CategoryInfo[]
): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first-chat',
      title: 'First Contact',
      description: 'Started your first conversation with ChatGPT',
      icon: '🎉',
      unlocked: conversations.length > 0,
      rarity: 'common',
      color: '#6C63FF',
    },
    {
      id: 'century',
      title: 'Century Club',
      description: 'Had 100+ conversations',
      icon: '💯',
      unlocked: conversations.length >= 100,
      rarity: 'rare',
      color: '#FF6B9D',
    },
    {
      id: 'thousand',
      title: 'Conversation Titan',
      description: 'Had 1000+ conversations',
      icon: '🏆',
      unlocked: conversations.length >= 1000,
      rarity: 'legendary',
      color: '#FFB347',
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Frequently chat between midnight and 5 AM',
      icon: '🦉',
      unlocked: timePatterns.isNightOwl,
      rarity: 'rare',
      color: '#4ECDC4',
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Your busiest hour is before 8 AM',
      icon: '🐦',
      unlocked: timePatterns.busiestHour < 8,
      rarity: 'rare',
      color: '#FBBF24',
    },
    {
      id: 'wordsmith',
      title: 'Wordsmith',
      description: 'Wrote 10,000+ words to ChatGPT',
      icon: '📝',
      unlocked: overview.totalUserWords >= 10000,
      rarity: 'common',
      color: '#A78BFA',
    },
    {
      id: 'novelist',
      title: 'Novel Writer',
      description: 'Wrote 100,000+ words (that\'s a novel!)',
      icon: '📖',
      unlocked: overview.totalUserWords >= 100000,
      rarity: 'epic',
      color: '#F472B6',
    },
    {
      id: 'polymath',
      title: 'Renaissance Mind',
      description: 'Explored 5+ different categories',
      icon: '🎭',
      unlocked: categories.length >= 5,
      rarity: 'epic',
      color: '#34D399',
    },
    {
      id: 'marathon',
      title: 'Marathon Runner',
      description: 'Had a conversation with 50+ messages',
      icon: '🏃',
      unlocked: overview.longestConversation.messageCount >= 50,
      rarity: 'rare',
      color: '#60A5FA',
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Averaged 3+ conversations per day',
      icon: '⚡',
      unlocked: overview.avgConversationsPerDay >= 3,
      rarity: 'epic',
      color: '#FF6B6B',
    },
    {
      id: 'coder',
      title: 'Code Companion',
      description: '30%+ of conversations about coding',
      icon: '💻',
      unlocked: (categories.find((c) => c.name === 'Coding & Development')?.percentage || 0) >= 30,
      rarity: 'rare',
      color: '#6C63FF',
    },
    {
      id: 'creative',
      title: 'Muse Whisperer',
      description: '20%+ of conversations about creative writing',
      icon: '✨',
      unlocked: (categories.find((c) => c.name === 'Creative Writing')?.percentage || 0) >= 20,
      rarity: 'rare',
      color: '#FF6B9D',
    },
    {
      id: 'weekend-warrior',
      title: 'Weekend Warrior',
      description: 'More active on weekends than weekdays',
      icon: '🎮',
      unlocked: timePatterns.weekdayVsWeekend.weekend > timePatterns.weekdayVsWeekend.weekday * 0.5,
      rarity: 'common',
      color: '#00D4AA',
    },
    {
      id: 'veteran',
      title: 'AI Veteran',
      description: 'Active for 180+ days',
      icon: '🎖️',
      unlocked: overview.totalDaysActive >= 180,
      rarity: 'epic',
      color: '#FFB347',
    },
  ];

  return achievements;
}

function generateMoodJourney(conversations: ParsedConversation[]): MoodPoint[] {
  // Group by month and analyze sentiment
  const monthlyMood = new Map<string, { totalSentiment: number; count: number }>();

  for (const conv of conversations) {
    const monthKey = format(conv.createdAt, 'MMM yyyy');
    const userTexts = conv.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');
    const sentiment = analyzeSentiment(userTexts);

    const existing = monthlyMood.get(monthKey) || { totalSentiment: 0, count: 0 };
    existing.totalSentiment += sentiment;
    existing.count += 1;
    monthlyMood.set(monthKey, existing);
  }

  const LABEL_KEYS: Record<string, string> = {
    '😄 Positive': 'positive',
    '🙂 Good': 'good',
    '😐 Neutral': 'neutral',
    '😕 Mixed': 'mixed',
    '😤 Frustrated': 'frustrated',
  };

  return Array.from(monthlyMood.entries()).map(([date, data]) => {
    const avg = data.totalSentiment / data.count;
    let label: string;
    if (avg > 0.3) label = '😄 Positive';
    else if (avg > 0.1) label = '🙂 Good';
    else if (avg > -0.1) label = '😐 Neutral';
    else if (avg > -0.3) label = '😕 Mixed';
    else label = '😤 Frustrated';

    return { date, sentiment: parseFloat(avg.toFixed(2)), label, labelKey: LABEL_KEYS[label] || 'neutral' };
  });
}

function generateEvolution(conversations: ParsedConversation[]): EvolutionPoint[] {
  // Split into quarters
  const chunkSize = Math.max(1, Math.ceil(conversations.length / 6));
  const chunks: ParsedConversation[][] = [];

  for (let i = 0; i < conversations.length; i += chunkSize) {
    chunks.push(conversations.slice(i, i + chunkSize));
  }

  return chunks.map((chunk) => {
    const firstDate = chunk[0]?.createdAt;
    const lastDate = chunk[chunk.length - 1]?.createdAt;
    const period = firstDate && lastDate
      ? `${format(firstDate, 'MMM yyyy')} - ${format(lastDate, 'MMM yyyy')}`
      : 'Unknown';

    const texts = chunk.flatMap((c) => [
      c.title,
      ...c.messages.filter((m) => m.role === 'user').slice(0, 3).map((m) => m.content.slice(0, 100)),
    ]);

    const topics = extractTopics(texts, 5).map((t) => t.topic);

    return {
      period,
      topics: topics.length > 0 ? topics : ['general chat'],
      messageCount: chunk.reduce((s, c) => s + c.messageCount, 0),
    };
  });
}

function generatePowerMetrics(conversations: ParsedConversation[], overview: OverviewStats): PowerMetrics {
  // Calculate streaks
  const dateSet = new Set(conversations.map((c) => format(c.createdAt, 'yyyy-MM-dd')));
  const sortedDates = Array.from(dateSet).sort();

  let longestStreak = 1;
  let currentStreakLen = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    if (differenceInDays(curr, prev) === 1) {
      currentStreakLen++;
      longestStreak = Math.max(longestStreak, currentStreakLen);
    } else {
      currentStreakLen = 1;
    }
  }

  // Most active day
  const dayCounts = new Map<string, number>();
  for (const conv of conversations) {
    const key = format(conv.createdAt, 'yyyy-MM-dd');
    dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
  }
  const mostActiveEntry = Array.from(dayCounts.entries()).reduce(
    (max, [date, count]) => (count > max.count ? { date, count } : max),
    { date: 'N/A', count: 0 }
  );

  // Count questions and code blocks
  let questionsAsked = 0;
  let codeBlocksGenerated = 0;
  let totalChars = 0;

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      totalChars += msg.content.length;
      if (msg.role === 'user' && msg.content.includes('?')) questionsAsked++;
      if (msg.role === 'assistant') {
        const codeBlocks = msg.content.match(/```/g);
        if (codeBlocks) codeBlocksGenerated += Math.floor(codeBlocks.length / 2);
      }
    }
  }

  // Friendship score (fun metric)
  const friendshipScore = Math.min(100, Math.round(
    (conversations.length * 0.05) +
    (overview.totalDaysActive * 0.1) +
    (questionsAsked * 0.02) +
    20
  ));

  const booksEquivalent = parseFloat((overview.totalWords / 50000).toFixed(1));

  return {
    longestStreak,
    currentStreak: currentStreakLen,
    mostActiveDay: mostActiveEntry,
    averageResponseTime: 'Instant ⚡',
    questionsAsked,
    codeBlocksGenerated,
    friendshipScore,
    totalCharacters: totalChars,
    booksEquivalent,
  };
}

function generateFunFacts(
  overview: OverviewStats,
  timePatterns: TimePatterns,
  personality: PersonalityProfile,
  powerMetrics: PowerMetrics
): FunFact[] {
  const facts: FunFact[] = [
    {
      emoji: '📚',
      text: `Your conversations contain ${overview.totalWords.toLocaleString()} words — that's equivalent to ${powerMetrics.booksEquivalent} books!`,
      key: 'wordsFact',
      params: { words: overview.totalWords.toLocaleString(), books: powerMetrics.booksEquivalent },
    },
    {
      emoji: '⏰',
      text: `Your peak ChatGPT hour is ${timePatterns.busiestHour}:00. ${timePatterns.isNightOwl ? 'You\'re a true night owl!' : 'You keep regular hours!'}`,
      key: 'peakHourFact',
      params: {
        hour: timePatterns.busiestHour,
        nightOwl: timePatterns.isNightOwl ? 'nightOwlYes' : 'nightOwlNo',
      },
    },
    {
      emoji: '📅',
      text: `${timePatterns.busiestDay} is your ChatGPT day — you chat the most on ${timePatterns.busiestDay}s!`,
      key: 'busiestDayFact',
      params: { day: timePatterns.busiestDay, dayKey: timePatterns.busiestDayKey },
    },
    {
      emoji: '🔥',
      text: `Your longest streak was ${powerMetrics.longestStreak} consecutive days of chatting!`,
      key: 'streakFact',
      params: { streak: powerMetrics.longestStreak },
    },
    {
      emoji: '❓',
      text: `You've asked approximately ${powerMetrics.questionsAsked.toLocaleString()} questions. Curiosity definitely isn't killing this cat!`,
      key: 'questionsFact',
      params: { count: powerMetrics.questionsAsked.toLocaleString() },
    },
    {
      emoji: '💻',
      text: powerMetrics.codeBlocksGenerated > 0
        ? `ChatGPT generated ${powerMetrics.codeBlocksGenerated.toLocaleString()} code blocks for you!`
        : 'You haven\'t needed much code from ChatGPT — a true self-coder!',
      key: powerMetrics.codeBlocksGenerated > 0 ? 'codeYesFact' : 'codeNoFact',
      params: { count: powerMetrics.codeBlocksGenerated.toLocaleString() },
    },
    {
      emoji: '💬',
      text: `Your longest conversation had ${overview.longestConversation.messageCount} messages: "${overview.longestConversation.title}"`,
      key: 'longestConvoFact',
      params: {
        count: overview.longestConversation.messageCount,
        title: overview.longestConversation.title,
      },
    },
    {
      emoji: '🎭',
      text: `Your AI personality type is "${personality.archetype}" — ${personality.archetypeDescription.split('.')[0]}.`,
      key: 'personalityFact',
      params: {
        archetype: personality.archetype,
        description: personality.archetypeDescription.split('.')[0],
      },
    },
    {
      emoji: '📊',
      text: `You average ${overview.avgConversationsPerDay} conversations per day across ${overview.totalDaysActive} days!`,
      key: 'avgPerDayFact',
      params: { avg: overview.avgConversationsPerDay, days: overview.totalDaysActive },
    },
    {
      emoji: '💕',
      text: `Your AI Friendship Score is ${powerMetrics.friendshipScore}/100. ${powerMetrics.friendshipScore > 70 ? 'You and ChatGPT are besties!' : 'Your friendship is growing!'}`,
      key: 'friendshipFact',
      params: {
        score: powerMetrics.friendshipScore,
        message: powerMetrics.friendshipScore > 70 ? 'friendshipBesties' : 'friendshipGrowing',
      },
    },
  ];

  return facts;
}

function generatePredictions(
  topics: TopicInfo[],
  categories: CategoryInfo[],
  personality: PersonalityProfile
): string[] {
  const topTopic = topics[0]?.topic || 'various topics';
  const topCategory = categories[0]?.name || 'General';

  return [
    `Based on your patterns, you'll probably ask about "${topTopic}" again this week 🎯`,
    `Your next big exploration will likely be in ${topCategory} — it's your comfort zone!`,
    `You're on track to have ${personality.traits[0].score > 70 ? 'an even more curious' : 'a steadily growing'} year with AI`,
    `We predict you'll unlock the "${personality.traits.find((t) => t.score < 50)?.name || 'Mastery'}" trait next — keep exploring!`,
    `Your conversation style suggests you'll become even more efficient with AI over time ⚡`,
  ];
}

function generateTimeMachine(conversations: ParsedConversation[]): TimeMachine {
  const first = conversations[0];
  const last = conversations[conversations.length - 1];

  const firstPreview = first?.messages.find((m) => m.role === 'user')?.content.slice(0, 150) || '';
  const lastPreview = last?.messages.find((m) => m.role === 'user')?.content.slice(0, 150) || '';

  return {
    firstConversation: {
      title: first?.title || 'Your first chat',
      date: first?.createdAt || new Date(),
      preview: firstPreview,
    },
    latestConversation: {
      title: last?.title || 'Your latest chat',
      date: last?.createdAt || new Date(),
      preview: lastPreview,
    },
    biggestShift: 'Your topics have evolved as you\'ve grown with AI — from simple questions to complex explorations.',
  };
}
