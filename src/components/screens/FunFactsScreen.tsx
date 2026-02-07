import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, x: -30, rotate: -2 },
  show: { opacity: 1, x: 0, rotate: 0 },
};

export default function FunFactsScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { funFacts, predictions } = analytics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('funFacts.title')}</span>
        </h2>
        <p className="text-white/40">{t('funFacts.subtitle')}</p>
      </motion.div>

      <div className="w-full max-w-2xl space-y-8">
        {/* Fun facts */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {funFacts.map((fact, i) => {
            const params = fact.params ? { ...fact.params } : {};
            if (params.nightOwl === 'nightOwlYes' || params.nightOwl === 'nightOwlNo') {
              params.nightOwl = t(`funFacts.${params.nightOwl}`);
            }
            if (params.message === 'friendshipBesties' || params.message === 'friendshipGrowing') {
              params.message = t(`funFacts.${params.message}`);
            }
            if (params.dayKey) {
              params.day = t(`timePatterns.daysFull.${params.dayKey}`);
              delete params.dayKey;
            }
            const text = fact.key ? t(`funFacts.${fact.key}`, params as Record<string, string | number>) : fact.text;

            return (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ scale: 1.02, x: 5 }}
                className="glass rounded-xl px-5 py-4 flex items-start gap-4"
              >
                <span className="text-2xl flex-shrink-0">{fact.emoji}</span>
                <p className="text-white/70 leading-relaxed">{text}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <h3 className="text-white/40 text-sm text-center mb-4 uppercase tracking-wider">
            {t('funFacts.predictionsTitle')}
          </h3>
          <div className="space-y-2">
            {predictions.slice(0, 3).map((pred, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + i * 0.2 }}
                className="glass rounded-xl px-5 py-3 text-white/50 text-sm"
              >
                {pred}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
