import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

export default function TimeMachineScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { timeMachine } = analytics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('timeMachine.title')}</span>
        </h2>
        <p className="text-white/40">{t('timeMachine.subtitle')}</p>
      </motion.div>

      <div className="w-full max-w-3xl flex flex-col md:flex-row items-stretch gap-6">
        {/* First conversation */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 glass rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent" />
          <p className="text-accent text-xs uppercase tracking-wider mb-3">{t('timeMachine.whereBegan')}</p>
          <p className="text-white/40 text-sm mb-2">
            {format(timeMachine.firstConversation.date, 'MMMM d, yyyy')}
          </p>
          <h3 className="text-white font-semibold text-lg mb-3">
            "{timeMachine.firstConversation.title}"
          </h3>
          {timeMachine.firstConversation.preview && (
            <div className="bg-dark-surface rounded-xl p-3">
              <p className="text-white/30 text-xs mb-1">{t('timeMachine.youSaid')}</p>
              <p className="text-white/60 text-sm italic leading-relaxed">
                "{timeMachine.firstConversation.preview.slice(0, 120)}..."
              </p>
            </div>
          )}
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center md:flex-col gap-2"
        >
          <ArrowRight size={24} className="text-primary hidden md:block" />
          <span className="text-white/20 text-xs">{t('timeMachine.thenNow')}</span>
        </motion.div>

        {/* Latest conversation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex-1 glass rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
          <p className="text-primary text-xs uppercase tracking-wider mb-3">{t('timeMachine.mostRecent')}</p>
          <p className="text-white/40 text-sm mb-2">
            {format(timeMachine.latestConversation.date, 'MMMM d, yyyy')}
          </p>
          <h3 className="text-white font-semibold text-lg mb-3">
            "{timeMachine.latestConversation.title}"
          </h3>
          {timeMachine.latestConversation.preview && (
            <div className="bg-dark-surface rounded-xl p-3">
              <p className="text-white/30 text-xs mb-1">{t('timeMachine.youSaid')}</p>
              <p className="text-white/60 text-sm italic leading-relaxed">
                "{timeMachine.latestConversation.preview.slice(0, 120)}..."
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 glass rounded-2xl p-5 max-w-lg text-center"
      >
        <p className="text-white/40 text-sm">{t('timeMachine.insight')}</p>
        <p className="text-white/70 mt-1 leading-relaxed">{t('timeMachine.biggestShift')}</p>
      </motion.div>
    </div>
  );
}
