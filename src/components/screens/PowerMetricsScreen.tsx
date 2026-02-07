import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Calendar, Code2, HelpCircle, Heart, BookOpen, Keyboard } from 'lucide-react';
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PowerMetricsScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { powerMetrics } = analytics;

  const metrics = [
    { icon: <Flame size={22} />, labelKey: 'powerMetrics.longestStreak', value: powerMetrics.longestStreak, suffix: ` ${t('powerMetrics.days')}`, color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    { icon: <Calendar size={22} />, labelKey: 'powerMetrics.mostActiveDay', displayText: `${powerMetrics.mostActiveDay.date} (${powerMetrics.mostActiveDay.count} ${t('timePatterns.chats')})`, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: <HelpCircle size={22} />, labelKey: 'powerMetrics.questionsAsked', value: powerMetrics.questionsAsked, color: 'text-accent', bgColor: 'bg-accent/10' },
    { icon: <Code2 size={22} />, labelKey: 'powerMetrics.codeBlocksGenerated', value: powerMetrics.codeBlocksGenerated, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' },
    { icon: <Keyboard size={22} />, labelKey: 'powerMetrics.totalCharacters', value: powerMetrics.totalCharacters, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { icon: <BookOpen size={22} />, labelKey: 'powerMetrics.booksEquivalent', value: powerMetrics.booksEquivalent, suffix: ` ${t('powerMetrics.books')}`, decimals: 1, color: 'text-accent-2', bgColor: 'bg-accent-2/10' },
  ];

  const friendshipMessageKey = powerMetrics.friendshipScore > 80 ? 'powerMetrics.friendshipHigh' : powerMetrics.friendshipScore > 50 ? 'powerMetrics.friendshipMid' : 'powerMetrics.friendshipLow';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('powerMetrics.title')}</span>
        </h2>
        <p className="text-white/40">{t('powerMetrics.subtitle')}</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full"
      >
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bgColor} ${metric.color}`}>
              {metric.icon}
            </div>
            <div>
              <p className="text-white/40 text-sm">{t(metric.labelKey)}</p>
              {'displayText' in metric ? (
                <p className="text-sm font-medium text-white">{metric.displayText}</p>
              ) : (
                <p className="text-xl font-bold text-white">
                  <AnimatedCounter
                    value={metric.value!}
                    suffix={'suffix' in metric ? metric.suffix : undefined}
                    decimals={'decimals' in metric ? metric.decimals : undefined}
                    duration={1.5}
                  />
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Friendship meter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 glass rounded-2xl p-6 max-w-md w-full text-center"
      >
        <Heart size={28} className="text-secondary mx-auto mb-3" />
        <p className="text-white/40 text-sm mb-2">{t('powerMetrics.aiFriendshipScore')}</p>
        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 bg-dark-surface rounded-full h-4 overflow-hidden max-w-xs">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${powerMetrics.friendshipScore}%` }}
              transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-warm rounded-full"
            />
          </div>
          <span className="text-2xl font-bold text-secondary">{powerMetrics.friendshipScore}%</span>
        </div>
        <p className="text-white/30 text-xs mt-2">
          {t(friendshipMessageKey)}
        </p>
      </motion.div>
    </div>
  );
}
