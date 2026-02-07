import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const PERIOD_COLORS = ['#6C63FF', '#FF6B9D', '#00D4AA', '#FFB347', '#A78BFA', '#4ECDC4'];

export default function EvolutionScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { evolution } = analytics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('evolution.title')}</span>
        </h2>
        <p className="text-white/40">{t('evolution.subtitle')}</p>
      </motion.div>

      {/* Timeline */}
      <div className="w-full max-w-2xl relative">
        {/* Center line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-dark-border" />

        {evolution.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.2 }}
            className={`relative mb-8 flex items-start ${
              i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } flex-row`}
          >
            {/* Dot */}
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: PERIOD_COLORS[i % PERIOD_COLORS.length],
                  backgroundColor: '#0F0B1E',
                }}
              />
            </div>

            {/* Content */}
            <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
              <div className="glass rounded-2xl p-4">
                <p className="text-white/40 text-xs mb-2">{point.period}</p>
                <div className="flex flex-wrap gap-2 mb-2" style={{ justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                  {point.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${PERIOD_COLORS[i % PERIOD_COLORS.length]}20`,
                        color: PERIOD_COLORS[i % PERIOD_COLORS.length],
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="text-white/30 text-xs">{t('evolution.messages', { count: point.messageCount })}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
