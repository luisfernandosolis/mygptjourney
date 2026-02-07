import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { topic: string; count: number } }[] }) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{payload[0].payload.topic}</p>
      <p className="text-primary">{payload[0].payload.count} {t('topics.mentions')}</p>
    </div>
  );
};

export default function TopicsScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { topTopics } = analytics;

  if (topTopics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-2xl font-bold text-white mb-2">{t('topics.title')}</h2>
          <p className="text-white/40">{t('topics.noData')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('topics.title')}</span>
        </h2>
        <p className="text-white/40">{t('topics.subtitle')}</p>
      </motion.div>

      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center gap-8">
        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-64 h-64 flex-shrink-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topTopics.slice(0, 8)}
                dataKey="count"
                nameKey="topic"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={3}
                animationBegin={500}
                animationDuration={1000}
              >
                {topTopics.slice(0, 8).map((t, i) => (
                  <Cell key={i} fill={t.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Topic list */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 space-y-2 w-full"
        >
          {topTopics.slice(0, 10).map((topic, i) => (
            <motion.div
              key={topic.topic}
              variants={item}
              className="flex items-center gap-3 glass rounded-xl px-4 py-3"
            >
              <span className="text-white/30 text-sm font-mono w-6">#{i + 1}</span>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: topic.color }}
              />
              <span className="text-white font-medium flex-1 truncate">{topic.topic}</span>
              <span className="text-white/40 text-sm">{topic.count}</span>
              <div className="w-16 bg-dark-surface rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.percentage}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: topic.color }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
