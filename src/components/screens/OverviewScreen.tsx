import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageSquare, FileText, Clock, BookOpen, Zap, Hash } from 'lucide-react';
import type { AnalyticsResult } from '../../types/chatgpt';
import AnimatedCounter from '../ui/AnimatedCounter';

interface Props {
  analytics: AnalyticsResult;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function OverviewScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { overview } = analytics;

  const stats = [
    { icon: <MessageSquare size={22} />, labelKey: 'overview.conversations', value: overview.totalConversations, color: 'from-primary to-primary-light', iconColor: 'text-primary' },
    { icon: <FileText size={22} />, labelKey: 'overview.messages', value: overview.totalMessages, color: 'from-secondary to-pink-400', iconColor: 'text-secondary' },
    { icon: <BookOpen size={22} />, labelKey: 'overview.wordsWritten', value: overview.totalUserWords, color: 'from-accent to-emerald-400', iconColor: 'text-accent' },
    { icon: <Clock size={22} />, labelKey: 'overview.daysActive', value: overview.totalDaysActive, color: 'from-accent-2 to-yellow-300', iconColor: 'text-accent-2' },
    { icon: <Zap size={22} />, labelKey: 'overview.avgPerDay', value: overview.avgConversationsPerDay, decimals: 1, color: 'from-purple-400 to-pink-400', iconColor: 'text-purple-400' },
    { icon: <Hash size={22} />, labelKey: 'overview.avgWordsPerMsg', value: overview.avgWordsPerMessage, color: 'from-cyan-400 to-blue-400', iconColor: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('overview.title')}</span>
        </h2>
        <p className="text-white/40">{t('overview.subtitle')}</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="glass rounded-2xl p-5 text-center hover:bg-dark-surface/50 transition-colors"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-dark-surface mb-3 ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">
              <AnimatedCounter
                value={stat.value}
                duration={1.5 + i * 0.2}
                decimals={'decimals' in stat ? stat.decimals : undefined}
              />
            </div>
            <div className="text-white/40 text-sm">{t(stat.labelKey)}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bonus stat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 glass rounded-2xl p-5 max-w-2xl w-full text-center"
      >
        <p className="text-white/40 text-sm mb-1">{t('overview.longestConversation')}</p>
        <p className="text-white font-medium">"{overview.longestConversation.title}"</p>
        <p className="text-primary text-sm mt-1">
          {t('overview.messagesCount', { count: overview.longestConversation.messageCount })}
        </p>
      </motion.div>
    </div>
  );
}
