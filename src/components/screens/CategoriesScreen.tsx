import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { model: string; count: number } }[] }) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{payload[0].payload.model}</p>
      <p className="text-primary">{payload[0].payload.count} {t('categories.conversations')}</p>
    </div>
  );
};

export default function CategoriesScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { categories, modelUsage } = analytics;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('categories.title')}</span>
        </h2>
        <p className="text-white/40">{t('categories.subtitle')}</p>
      </motion.div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Category grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={item}
              whileHover={{ scale: 1.03 }}
              className="glass rounded-2xl p-4 text-center relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{ background: `linear-gradient(135deg, ${cat.color} 0%, transparent 100%)` }}
              />
              <span className="text-3xl block mb-2">{cat.icon}</span>
              <p className="text-white font-medium text-sm mb-1">{t(`categories.${cat.nameKey}`)}</p>
              <p className="text-2xl font-bold" style={{ color: cat.color }}>
                {cat.percentage}%
              </p>
              <p className="text-white/30 text-xs mt-1">{cat.count} {t('categories.chats')}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Model usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-white/60 text-sm mb-4">{t('categories.modelsUsed')}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={modelUsage.slice(0, 6)} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="model"
                tick={{ fill: '#ffffff80', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#6C63FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
