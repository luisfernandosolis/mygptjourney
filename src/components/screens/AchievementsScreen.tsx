import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const RARITY_STYLES: Record<string, string> = {
  common: 'border-gray-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30',
};

const RARITY_GLOW: Record<string, string> = {
  common: '',
  rare: 'shadow-blue-500/10',
  epic: 'shadow-purple-500/10',
  legendary: 'shadow-yellow-500/20',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, rotateX: 90 },
  show: { opacity: 1, y: 0, rotateX: 0 },
};

export default function AchievementsScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { achievements } = analytics;
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('achievements.title')}</span>
        </h2>
        <p className="text-white/40">
          {t('achievements.unlocked', { unlocked: unlocked.length, total: achievements.length })}
        </p>
      </motion.div>

      {/* Trophy count */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="text-6xl mb-8"
      >
        🏆
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl w-full"
      >
        {[...unlocked, ...locked].map((achievement) => {
          const rarityStyle = RARITY_STYLES[achievement.rarity];
          const rarityGlow = RARITY_GLOW[achievement.rarity];
          const rarityColor = achievement.rarity === 'common' ? 'text-gray-400' : achievement.rarity === 'rare' ? 'text-blue-400' : achievement.rarity === 'epic' ? 'text-purple-400' : 'text-yellow-400';

          return (
            <motion.div
              key={achievement.id}
              variants={item}
              whileHover={achievement.unlocked ? { scale: 1.05 } : {}}
              className={`relative rounded-2xl border p-4 text-center transition-all ${
                achievement.unlocked
                  ? `glass ${rarityStyle} shadow-lg ${rarityGlow}`
                  : 'bg-dark-surface/30 border-dark-border opacity-50'
              }`}
            >
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Lock size={20} className="text-white/20" />
                </div>
              )}

              <div className={`text-3xl mb-2 ${!achievement.unlocked ? 'blur-sm' : ''}`}>
                {achievement.icon}
              </div>

              <p className={`font-medium text-sm mb-1 ${achievement.unlocked ? 'text-white' : 'text-white/30'}`}>
                {t(`achievements.items.${achievement.id}.title`)}
              </p>

              <p className={`text-xs ${achievement.unlocked ? 'text-white/40' : 'text-white/20'}`}>
                {t(`achievements.items.${achievement.id}.description`)}
              </p>

              {achievement.unlocked && (
                <span className={`inline-block mt-2 text-[10px] uppercase tracking-wider ${rarityColor}`}>
                  {t(`achievements.rarity.${achievement.rarity}`)}
                </span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
