import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download, Twitter, Linkedin, Copy, Check, RotateCcw, Share2, User, ImagePlus } from 'lucide-react';
import type { AnalyticsResult, CategoryInfo } from '../../types/chatgpt';
import {
  downloadShareImage,
  shareToTwitter,
  shareToLinkedIn,
  copyToClipboard,
  generateShareText,
  generateAndUploadShareImage,
  uploadUserPhotoToSupabase,
} from '../../utils/imageGenerator';
import { supabase } from '../../lib/supabase';

const SHARE_CARD_CATEGORY_MAP: Record<string, string> = {
  'Coding & Development': 'programacion',
  'Creative Writing': 'vidaPersonal',
  'Learning & Education': 'matematicas',
  'Business & Career': 'negocios',
  'Data & Analytics': 'matematicas',
  'Personal & Lifestyle': 'vidaPersonal',
  'Research & Analysis': 'matematicas',
  'Design & Creativity': 'diseno',
  'General': 'vidaPersonal',
};

function getShareCardCategories(categories: CategoryInfo[]): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const cat of categories) {
    const key = SHARE_CARD_CATEGORY_MAP[cat.name] || 'vidaPersonal';
    counts.set(key, (counts.get(key) || 0) + cat.count);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

interface Props {
  analytics: AnalyticsResult;
  onReset: () => void;
}

export default function SummaryScreen({ analytics, onReset }: Props) {
  const { t } = useTranslation();
  const { overview, personality, topTopics, powerMetrics, categories } = analytics;
  const shareCardCategories = getShareCardCategories(categories);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  const canShare = userName.trim().length > 0 && userPhotoUrl !== null;
  const useSupabase = supabase !== null;

  useEffect(() => () => {
    if (userPhotoUrl?.startsWith('blob:')) URL.revokeObjectURL(userPhotoUrl);
  }, [userPhotoUrl]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (userPhotoUrl?.startsWith('blob:')) URL.revokeObjectURL(userPhotoUrl);

    if (useSupabase) {
      setUploadingPhoto(true);
      const url = await uploadUserPhotoToSupabase(file);
      setUploadingPhoto(false);
      if (url) {
        setUserPhotoUrl(url);
      } else {
        setUserPhotoUrl(URL.createObjectURL(file));
      }
    } else {
      setUserPhotoUrl(URL.createObjectURL(file));
    }
  };

  const shareText = generateShareText({
    totalConversations: overview.totalConversations,
    totalMessages: overview.totalMessages,
    archetype: personality.archetype,
    topTopic: shareCardCategories[0] ? t(`summary.shareCategories.${shareCardCategories[0].key}`) : topTopics[0]?.topic || 'AI',
    streak: powerMetrics.longestStreak,
  });

  const handleCopy = async () => {
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ensureUploadedImage = async (): Promise<string | null> => {
    if (uploadedImageUrl) return uploadedImageUrl;
    if (!useSupabase) return null;
    setUploading(true);
    const url = await generateAndUploadShareImage('share-card');
    setUploading(false);
    if (url) setUploadedImageUrl(url);
    return url;
  };

  const getDownloadFilename = () => {
    const firstName = userName.trim().split(/\s+/)[0] || 'user';
    const sanitized = firstName.replace(/[/\\:*?"<>|]/g, '');
    return `the gpt wrapped of ${sanitized || 'user'}.png`;
  };

  const handleDownload = async () => {
    if (!canShare) {
      alert(t('summary.namePhotoRequired'));
      return;
    }
    setDownloading(true);
    const filename = getDownloadFilename();
    if (useSupabase) {
      const url = await ensureUploadedImage();
      if (url) {
        const success = await downloadShareImage('share-card', filename, url);
        if (!success) alert(t('summary.downloadError'));
      } else {
        alert(t('summary.uploadError'));
      }
    } else {
      const success = await downloadShareImage('share-card', filename);
      if (!success) alert(t('summary.downloadError'));
    }
    setDownloading(false);
  };

  const handleLinkedIn = async () => {
    if (!canShare) {
      alert(t('summary.namePhotoRequired'));
      return;
    }
    if (useSupabase) {
      const url = await ensureUploadedImage();
      if (url) {
        shareToLinkedIn(shareText, url);
      } else {
        alert(t('summary.uploadError'));
      }
    } else {
      shareToLinkedIn(shareText);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('summary.title')}</span>
        </h2>
        <p className="text-white/40">{t('summary.subtitle')}</p>
      </motion.div>

      {/* Personalization inputs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mb-4"
      >
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value.slice(0, 30))}
          placeholder={t('summary.namePlaceholder')}
          className="flex-1 px-4 py-3 rounded-xl glass bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={30}
        />
        <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass bg-white/5 border border-white/10 text-white/80 ${uploadingPhoto ? 'opacity-50 cursor-wait' : 'btn-tap hover:bg-white/10 cursor-pointer'}`}>
          <ImagePlus size={18} />
          <span>{uploadingPhoto ? t('summary.uploading') : t('summary.photoPlaceholder')}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={uploadingPhoto}
            className="hidden"
          />
        </label>
      </motion.div>
      {!canShare && (
        <p className="text-white/30 text-xs mb-4">{t('summary.namePhotoRequiredHint')}</p>
      )}

      {/* Share card - OpenAI theme */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        id="share-card"
        className="w-full max-w-sm rounded-3xl overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #0D1117 100%)',
          border: '1px solid rgba(0, 166, 126, 0.2)',
        }}
      >
        <div className="p-8">
          {/* User name and photo */}
          {(userName || userPhotoUrl) && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(0, 166, 126, 0.15)' }}
              >
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (() => {
                  const initials = userName
                    .trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return initials ? (
                    <span className="text-white font-semibold text-lg">{initials}</span>
                  ) : (
                    <User size={24} className="text-white/40" />
                  );
                })()}
              </div>
              {userName && (
                <p className="text-white font-semibold text-lg truncate max-w-[180px]">{userName}</p>
              )}
            </div>
          )}

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/openai-logo.svg" alt="OpenAI" className="w-6 h-6" />
              <h3 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                {t('app.title')}
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {t('summary.aiWrapped')}
            </p>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{personality.archetypeEmoji}</div>
            <p className="text-white font-semibold">{t(`personality.archetypes.${personality.archetypeKey}`)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(22, 27, 34, 0.8)', border: '1px solid rgba(0, 166, 126, 0.15)' }}
            >
              <p className="text-xl font-bold" style={{ color: '#00A67E' }}>
                {overview.totalConversations.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('summary.conversations')}
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(22, 27, 34, 0.8)', border: '1px solid rgba(0, 166, 126, 0.15)' }}
            >
              <p className="text-xl font-bold" style={{ color: '#58A6FF' }}>
                {overview.totalMessages.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('summary.messages')}
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(22, 27, 34, 0.8)', border: '1px solid rgba(0, 166, 126, 0.15)' }}
            >
              <p className="text-xl font-bold" style={{ color: '#00A67E' }}>
                {powerMetrics.longestStreak}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('summary.dayStreak')}
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(22, 27, 34, 0.8)', border: '1px solid rgba(0, 166, 126, 0.15)' }}
            >
              <p className="text-xl font-bold" style={{ color: '#58A6FF' }}>
                {shareCardCategories[0] ? t(`summary.shareCategories.${shareCardCategories[0].key}`) : 'N/A'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('summary.topCategory')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-center mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {t('summary.friendshipScoreTitle')}
            </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(22, 27, 34, 0.9)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${powerMetrics.friendshipScore}%`,
                      background: 'linear-gradient(90deg, #FF6B9D 0%, #00A67E 100%)',
                    }}
                  />
                </div>
                <span
                  className="text-sm font-bold shrink-0 w-12 text-right"
                  style={{ color: '#FF6B9D' }}
                >
                  {t('summary.friendshipScorePercent', { value: powerMetrics.friendshipScore })}
                </span>
              </div>
          </div>
        </div>
      </motion.div>

      {/* Share buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mb-6"
      >
        <button
          onClick={handleDownload}
          disabled={!canShare || downloading || uploading || uploadingPhoto}
          className="btn-tap flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-primary text-white font-medium hover:opacity-90 glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          {uploading ? t('summary.uploading') : downloading ? t('summary.saving') : t('summary.saveImage')}
        </button>

        <button
          onClick={() => shareToTwitter(shareText)}
          disabled={!canShare}
          className="btn-tap flex items-center gap-2 px-5 py-3 rounded-full glass hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Twitter size={16} />
          {t('summary.twitter')}
        </button>

        <button
          onClick={handleLinkedIn}
          disabled={!canShare || uploading || uploadingPhoto}
          className="btn-tap flex items-center gap-2 px-5 py-3 rounded-full glass hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Linkedin size={16} />
          {t('summary.linkedin')}
        </button>

        <button
          onClick={handleCopy}
          disabled={!canShare}
          className="btn-tap flex items-center gap-2 px-5 py-3 rounded-full glass hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Check size={16} className="text-accent" />
                <span className="text-accent">{t('summary.copied')}</span>
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Copy size={16} />
                {t('summary.copyText')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Native share */}
      {navigator.share && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => canShare && navigator.share({ title: t('summary.shareTitle'), text: shareText })}
          disabled={!canShare}
          className="btn-tap flex items-center gap-2 text-white/40 hover:text-white/60 mb-8 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Share2 size={14} />
          {t('summary.moreSharing')}
        </motion.button>
      )}

      {/* Reset */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onReset}
        className="btn-tap flex items-center gap-2 text-white/30 hover:text-white/50 text-sm cursor-pointer"
      >
        <RotateCcw size={14} />
        {t('summary.startOver')}
      </motion.button>

      {/* Privacy note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-white/20 text-xs text-center max-w-sm"
      >
        {t('summary.privacy')}
      </motion.p>
    </div>
  );
}
