import { toBlob } from 'html-to-image';
import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'share-cards';
const USER_PHOTOS_PREFIX = 'user-photos';

export async function uploadUserPhotoToSupabase(file: File): Promise<string | null> {
  if (!supabase) return null;
  if (!file.type.startsWith('image/')) return null;

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'png';
  const fileName = `${USER_PHOTOS_PREFIX}/${crypto.randomUUID()}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error('Supabase upload error (user photo):', error);
    return null;
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function generateShareImage(elementId: string): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  element.scrollIntoView({ block: 'center', behavior: 'instant' });
  await new Promise((r) => requestAnimationFrame(r));

  try {
    const blob = await toBlob(element, {
      backgroundColor: '#0D1117',
      cacheBust: true,
      pixelRatio: 2,
      skipFonts: true,
      fontEmbedCSS: '', // Bypass getWebFontCSS entirely to avoid cssRules SecurityError on cross-origin stylesheets
      fetchRequestInit: { mode: 'cors' },
    });
    return blob;
  } catch (err) {
    console.error('html-to-image error:', err);
    return null;
  }
}

export async function uploadShareImageToSupabase(blob: Blob): Promise<string | null> {
  if (!supabase) return null;

  const fileName = `${crypto.randomUUID()}-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, { contentType: 'image/png', upsert: false });

  if (error) {
    console.error('Supabase upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function generateAndUploadShareImage(elementId: string): Promise<string | null> {
  const blob = await generateShareImage(elementId);
  if (!blob) return null;
  return uploadShareImageToSupabase(blob);
}

export async function downloadShareImage(
  elementId: string,
  filename = 'my-gpt-journey.png',
  imageUrl?: string | null
): Promise<boolean> {
  if (imageUrl) {
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) return false;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      return true;
    } catch {
      return false;
    }
  }

  const blob = await generateShareImage(elementId);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  return true;
}

export function shareToTwitter(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

export function shareToLinkedIn(text: string, imageUrl?: string | null): void {
  const shareUrl = imageUrl || 'https://mygptjourney.com';
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateShareText(stats: {
  totalConversations: number;
  totalMessages: number;
  archetype: string;
  topTopic: string;
  streak: number;
}): string {
  return `🚀 My GPT Wrapped!\n\n💬 ${stats.totalConversations.toLocaleString()} conversations\n📝 ${stats.totalMessages.toLocaleString()} messages\n🎭 Personality: ${stats.archetype}\n🏆 Top topic: ${stats.topTopic}\n🔥 Longest streak: ${stats.streak} days\n\n#MyGPTWrapped #ChatGPT #AIWrapped`;
}
