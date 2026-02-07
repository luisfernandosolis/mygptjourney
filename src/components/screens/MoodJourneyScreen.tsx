import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { date: string; sentiment: number; label: string } }[] }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-sm">
      <p className="text-white/60">{data.date}</p>
      <p className="text-white font-medium">{data.label}</p>
      <p className="text-primary">Score: {data.sentiment}</p>
    </div>
  );
};

export default function MoodJourneyScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { moodJourney } = analytics;

  if (moodJourney.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-4xl mb-4">😊</p>
          <h2 className="text-2xl font-bold text-white mb-2">{t('moodJourney.title')}</h2>
          <p className="text-white/40">{t('moodJourney.noData')}</p>
        </motion.div>
      </div>
    );
  }

  const avgMood = moodJourney.reduce((sum, m) => sum + m.sentiment, 0) / moodJourney.length;
  const moodLabelKey = avgMood > 0.3 ? 'positive' : avgMood > 0.1 ? 'good' : avgMood > -0.1 ? 'neutral' : avgMood > -0.3 ? 'mixed' : 'frustrated';
  const moodEmoji = avgMood > 0.2 ? '😄' : avgMood > 0 ? '🙂' : avgMood > -0.1 ? '😐' : '😕';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('moodJourney.title')}</span>
        </h2>
        <p className="text-white/40">{t('moodJourney.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="text-5xl mb-2"
      >
        {moodEmoji}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 text-sm mb-8"
      >
        {t('moodJourney.overallMood')}: <span className="text-primary font-semibold">{t(`moodJourney.labels.${moodLabelKey}`)}</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-3xl glass rounded-2xl p-5"
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={moodJourney}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#ffffff40', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fill: '#ffffff40', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v > 0 ? '😊' : v < 0 ? '😕' : '😐')}
            />
            <ReferenceLine y={0} stroke="#ffffff10" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#6C63FF"
              strokeWidth={3}
              dot={{ fill: '#6C63FF', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#FF6B9D' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Mood timeline highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 flex gap-4 flex-wrap justify-center"
      >
        {moodJourney.slice(0, 4).map((point) => (
          <div key={point.date} className="glass rounded-xl px-4 py-2 text-center">
            <p className="text-white/30 text-xs">{point.date}</p>
            <p className="text-white text-sm">{t(`moodJourney.labels.${point.labelKey}`)}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
