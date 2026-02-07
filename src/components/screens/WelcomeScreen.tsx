import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

export default function WelcomeScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { overview } = analytics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-7xl mb-6"
      >
        {analytics.personality.archetypeEmoji}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl md:text-6xl font-bold mb-4"
      >
        <span className="text-gradient">{t('welcome.title')}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-xl text-white/50 mb-8 max-w-md"
      >
        {t('welcome.analyzed', {
          conversations: overview.totalConversations.toLocaleString(),
          messages: overview.totalMessages.toLocaleString(),
        })}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass rounded-2xl p-6 max-w-sm"
      >
        <p className="text-white/40 text-sm mb-2">{t('welcome.journeySpans')}</p>
        <p className="text-3xl font-bold text-white mb-1">
          {overview.totalDaysActive} <span className="text-primary text-lg">{t('welcome.days')}</span>
        </p>
        <p className="text-white/40 text-sm">
          {t('welcome.fromTo', {
            from: overview.firstConversation.date.toLocaleDateString(),
            to: overview.lastConversation.date.toLocaleDateString(),
          })}
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 text-white/30 text-sm"
      >
        {t('welcome.swipeHint')}
      </motion.p>
    </div>
  );
}
