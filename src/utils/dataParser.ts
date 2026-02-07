import type { RawConversation, ParsedConversation, ParsedMessage } from '../types/chatgpt';

export function parseConversations(raw: RawConversation[]): ParsedConversation[] {
  return raw
    .filter((conv) => conv.mapping && Object.keys(conv.mapping).length > 0)
    .map(parseOneConversation)
    .filter((conv) => conv.messages.length > 0)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function parseOneConversation(raw: RawConversation): ParsedConversation {
  const messages: ParsedMessage[] = [];
  let model = raw.default_model_slug || 'unknown';

  for (const node of Object.values(raw.mapping)) {
    if (!node.message) continue;
    const msg = node.message;
    if (msg.author.role === 'system') continue;

    const parts = msg.content.parts;
    if (!parts) continue;

    const textParts = parts.filter((p): p is string => typeof p === 'string');
    const content = textParts.join('\n').trim();
    if (!content) continue;

    if (msg.metadata?.model_slug && msg.author.role === 'assistant') {
      model = msg.metadata.model_slug as string;
    }

    messages.push({
      id: msg.id,
      role: msg.author.role as ParsedMessage['role'],
      content,
      timestamp: msg.create_time ? new Date(msg.create_time * 1000) : null,
      model: msg.metadata?.model_slug as string | undefined,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    });
  }

  // Sort by timestamp if available
  messages.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const totalWords = messages.reduce((sum, m) => sum + m.wordCount, 0);
  const userWords = userMessages.reduce((sum, m) => sum + m.wordCount, 0);

  return {
    id: raw.conversation_id || crypto.randomUUID(),
    title: raw.title || 'Untitled',
    createdAt: new Date(raw.create_time * 1000),
    updatedAt: new Date(raw.update_time * 1000),
    messages,
    model,
    messageCount: messages.length,
    userMessageCount: userMessages.length,
    assistantMessageCount: assistantMessages.length,
    wordCount: totalWords,
    userWordCount: userWords,
  };
}

export function validateChatGPTExport(data: unknown): data is RawConversation[] {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;

  const sample = data[0];
  return (
    typeof sample === 'object' &&
    sample !== null &&
    'mapping' in sample &&
    ('create_time' in sample || 'title' in sample)
  );
}

export function readFileAsJSON(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        resolve(json);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
