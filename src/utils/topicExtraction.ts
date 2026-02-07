import nlp from 'compromise';
import { eng, spa, por, porBr } from 'stopword';

function normalizeForStopword(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Combina stopwords de inglés, español y portugués (normalizados sin acentos)
const STOP_WORDS = new Set([
  ...eng.map((w) => normalizeForStopword(w.toLowerCase())),
  ...spa.map((w) => normalizeForStopword(w.toLowerCase())),
  ...por.map((w) => normalizeForStopword(w.toLowerCase())),
  ...porBr.map((w) => normalizeForStopword(w.toLowerCase())),
  // Palabras específicas del dominio ChatGPT
  'chatgpt', 'chat', 'gpt', 'hi', 'hello', 'hey',
]);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Coding & Development': [
    'code', 'programming', 'python', 'javascript', 'typescript', 'react',
    'api', 'function', 'variable', 'database', 'sql', 'html', 'css',
    'bug', 'error', 'debug', 'git', 'deploy', 'server', 'frontend',
    'backend', 'algorithm', 'data structure', 'class', 'object', 'array',
    'loop', 'string', 'component', 'framework', 'library', 'node',
    'npm', 'webpack', 'docker', 'aws', 'cloud', 'devops', 'testing',
    'java', 'rust', 'golang', 'swift', 'kotlin', 'flutter', 'angular',
    'vue', 'nextjs', 'tailwind', 'mongodb', 'postgres', 'redis',
  ],
  'Creative Writing': [
    'write', 'story', 'poem', 'essay', 'creative', 'fiction', 'novel',
    'character', 'plot', 'narrative', 'dialogue', 'chapter', 'draft',
    'blog', 'article', 'content', 'copywriting', 'script', 'lyrics',
    'haiku', 'sonnet', 'prose', 'metaphor',
  ],
  'Learning & Education': [
    'learn', 'explain', 'understand', 'concept', 'tutorial', 'course',
    'study', 'teach', 'knowledge', 'lesson', 'theory', 'practice',
    'beginner', 'advanced', 'fundamentals', 'basics', 'definition',
    'difference', 'compare', 'history', 'science', 'math', 'physics',
    'chemistry', 'biology', 'philosophy', 'economics',
  ],
  'Business & Career': [
    'business', 'startup', 'marketing', 'strategy', 'revenue', 'client',
    'project', 'management', 'team', 'leadership', 'resume', 'interview',
    'career', 'salary', 'job', 'linkedin', 'networking', 'pitch',
    'investor', 'product', 'market', 'sales', 'growth', 'kpi',
    'presentation', 'proposal', 'email', 'professional',
  ],
  'Data & Analytics': [
    'data', 'analysis', 'machine learning', 'ai', 'model', 'neural',
    'deep learning', 'statistics', 'visualization', 'pandas', 'numpy',
    'tensorflow', 'pytorch', 'dataset', 'training', 'prediction',
    'classification', 'regression', 'nlp', 'computer vision',
    'artificial intelligence', 'prompt', 'llm', 'transformer',
  ],
  'Personal & Lifestyle': [
    'recipe', 'travel', 'health', 'fitness', 'diet', 'meditation',
    'hobby', 'relationship', 'advice', 'life', 'personal', 'habit',
    'goal', 'motivation', 'self-improvement', 'mental health',
    'workout', 'sleep', 'stress', 'mindfulness', 'cooking', 'food',
  ],
  'Research & Analysis': [
    'research', 'analyze', 'compare', 'review', 'evaluate', 'summarize',
    'report', 'findings', 'methodology', 'hypothesis', 'conclusion',
    'evidence', 'source', 'reference', 'study', 'paper', 'journal',
    'literature', 'survey', 'investigation',
  ],
  'Design & Creativity': [
    'design', 'ui', 'ux', 'figma', 'logo', 'brand', 'color', 'layout',
    'typography', 'illustration', 'graphic', 'visual', 'aesthetic',
    'wireframe', 'prototype', 'mockup', 'icon', 'animation',
    'photoshop', 'canva', 'image',
  ],
};

export function extractTopics(texts: string[], maxTopics = 12): { topic: string; count: number }[] {
  const topicCounts = new Map<string, number>();

  for (const text of texts) {
    const doc = nlp(text.slice(0, 500));

    // Extract nouns and noun phrases
    const nouns = doc.nouns().toSingular().out('array') as string[];
    const topics = doc.topics().out('array') as string[];

    for (const term of [...nouns, ...topics]) {
      const normalized = normalizeForStopword(term.toLowerCase().trim());
      const clean = normalized.replace(/[^a-z0-9'-]/g, '');
      if (clean.length < 3 || clean.length > 30) continue;
      if (STOP_WORDS.has(clean)) continue;
      if (/^\d+$/.test(clean)) continue;

      topicCounts.set(clean, (topicCounts.get(clean) || 0) + 1);
    }
  }

  return Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxTopics);
}

export function categorizeConversation(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = 'General';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score += keyword.includes(' ') ? 3 : 1; // multi-word matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export function extractWordFrequencies(texts: string[], maxWords = 80): { text: string; value: number }[] {
  const wordCounts = new Map<string, number>();

  for (const text of texts) {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const normalized = normalizeForStopword(word);
      const clean = normalized.replace(/[^a-z0-9'-]/g, '');
      if (clean.length < 3 || clean.length > 20) continue;
      if (STOP_WORDS.has(clean)) continue;
      if (/^\d+$/.test(clean)) continue;
      wordCounts.set(clean, (wordCounts.get(clean) || 0) + 1);
    }
  }

  return Array.from(wordCounts.entries())
    .map(([text, value]) => ({ text, value }))
    .filter((w) => w.value >= 3)
    .sort((a, b) => b.value - a.value)
    .slice(0, maxWords);
}

export function analyzeSentiment(text: string): number {
  const positive = [
    'great', 'good', 'excellent', 'amazing', 'awesome', 'love', 'thank',
    'thanks', 'perfect', 'wonderful', 'helpful', 'fantastic', 'brilliant',
    'happy', 'excited', 'beautiful', 'cool', 'nice', 'impressive',
    'appreciate', 'enjoy', 'best', 'incredible', 'outstanding',
  ];
  const negative = [
    'bad', 'wrong', 'error', 'fail', 'hate', 'terrible', 'awful',
    'horrible', 'broken', 'bug', 'issue', 'problem', 'frustrat',
    'confus', 'difficult', 'annoying', 'disappoint', 'worse', 'worst',
    'ugly', 'stupid', 'boring', 'useless',
  ];

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  let score = 0;

  for (const word of words) {
    if (positive.some((p) => word.includes(p))) score += 1;
    if (negative.some((n) => word.includes(n))) score -= 1;
  }

  // Normalize to -1 to 1
  const maxPossible = Math.max(words.length * 0.1, 1);
  return Math.max(-1, Math.min(1, score / maxPossible));
}

export { CATEGORY_KEYWORDS };
