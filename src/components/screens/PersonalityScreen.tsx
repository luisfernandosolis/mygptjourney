import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

export default function PersonalityScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { personality } = analytics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Archetype reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-8xl mb-4"
        >
          {personality.archetypeEmoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/40 text-sm uppercase tracking-widest mb-2">{t('personality.title')}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-3">
            {t(`personality.archetypes.${personality.archetypeKey}`)}
          </h2>
          <p className="text-white/50 max-w-md mx-auto leading-relaxed">
            {t(`personality.archetypes.${personality.archetypeKey}_desc`)}
          </p>
        </motion.div>
      </motion.div>

      {/* Trait bars */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md space-y-4"
      >
        <h3 className="text-white/40 text-sm text-center mb-4">{t('personality.traitProfile')}</h3>

        {personality.traits.map((trait, i) => (
          <motion.div
            key={trait.nameKey}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.15 }}
            className="flex items-center gap-3"
          >
            <span className="text-white/60 text-sm w-24 text-right">{t(`personality.traits.${trait.nameKey}`)}</span>
            <div className="flex-1 bg-dark-surface rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trait.score}%` }}
                transition={{ delay: 1.2 + i * 0.15, duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: trait.color }}
              />
            </div>
            <span className="text-white/40 text-sm w-8 font-mono">{trait.score}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Fun title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mt-10 glass rounded-2xl px-6 py-4 text-center"
      >
        <p className="text-white/40 text-sm">{t('personality.funTitle')}</p>
        <p className="text-lg font-semibold text-primary">{t(`personality.archetypes.${personality.archetypeKey}_fun`)}</p>
      </motion.div>

      {/* Conversation style */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3 }}
        className="mt-4 text-white/30 text-sm text-center"
      >
        {t(`personality.styles.${personality.styleKey}`)}
      </motion.p>
    </div>
  );
}
