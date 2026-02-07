import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const COLORS = [
  '#6C63FF', '#FF6B9D', '#00D4AA', '#FFB347', '#A78BFA',
  '#4ECDC4', '#F472B6', '#34D399', '#FBBF24', '#60A5FA',
  '#C084FC', '#FB923C', '#22D3EE', '#E879F9', '#84CC16',
];

export default function WordCloudScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { wordCloud } = analytics;

  if (wordCloud.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-4xl mb-4">💭</p>
          <h2 className="text-2xl font-bold text-white mb-2">{t('wordCloud.title')}</h2>
          <p className="text-white/40">{t('wordCloud.noData')}</p>
        </motion.div>
      </div>
    );
  }

  const maxValue = wordCloud[0]?.value || 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('wordCloud.title')}</span>
        </h2>
        <p className="text-white/40">{t('wordCloud.subtitle')}</p>
      </motion.div>

      {/* Word cloud visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center items-center gap-2 max-w-3xl"
      >
        {wordCloud.slice(0, 60).map((word, i) => {
          const ratio = word.value / maxValue;
          const fontSize = 14 + ratio * 36;
          const opacity = 0.4 + ratio * 0.6;
          const color = COLORS[i % COLORS.length];

          return (
            <motion.span
              key={word.text}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity, scale: 1 }}
              transition={{
                delay: 0.3 + i * 0.03,
                type: 'spring',
                stiffness: 200,
              }}
              whileHover={{ scale: 1.2, opacity: 1 }}
              className="cursor-default font-medium transition-all duration-200 px-1"
              style={{
                fontSize: `${fontSize}px`,
                color,
              }}
              title={t('wordCloud.uses', { count: word.value })}
            >
              {word.text}
            </motion.span>
          );
        })}
      </motion.div>

      {/* Top 3 words */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-10 flex gap-4"
      >
        {wordCloud.slice(0, 3).map((word, i) => (
          <div key={word.text} className="glass rounded-xl px-4 py-2 text-center">
            <span className="text-white/30 text-xs">#{i + 1}</span>
            <p className="text-white font-semibold">{word.text}</p>
            <p className="text-primary text-xs">{word.value}x</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
