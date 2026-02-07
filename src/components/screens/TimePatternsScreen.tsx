import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import type { AnalyticsResult } from '../../types/chatgpt';

interface Props {
  analytics: AnalyticsResult;
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12am';
  if (i === 12) return '12pm';
  if (i < 12) return `${i}am`;
  return `${i - 12}pm`;
});

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-sm">
      <p className="text-white/60">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value} {t('timePatterns.chats')}</p>
    </div>
  );
};

export default function TimePatternsScreen({ analytics }: Props) {
  const { t } = useTranslation();
  const { timePatterns } = analytics;

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

  const hourlyData = timePatterns.hourlyDistribution.map((count, i) => ({
    hour: HOUR_LABELS[i],
    count,
  }));

  const dailyData = timePatterns.dailyDistribution.map((count, i) => ({
    day: t(`timePatterns.days.${DAY_KEYS[i]}`),
    count,
  }));

  const periodIcon = () => {
    switch (timePatterns.peakPeriod) {
      case 'Morning': return <Sunrise size={24} className="text-accent-2" />;
      case 'Afternoon': return <Sun size={24} className="text-accent-2" />;
      case 'Evening': return <Sunset size={24} className="text-secondary" />;
      default: return <Moon size={24} className="text-primary-light" />;
    }
  };

  const peakPeriodTranslated = t(`timePatterns.periods.${timePatterns.peakPeriodKey}`);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-gradient">{t('timePatterns.title')}</span>
        </h2>
        <p className="text-white/40">{t('timePatterns.subtitle')}</p>
      </motion.div>

      {/* Peak period badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 glass rounded-full px-5 py-3 mb-8"
      >
        {periodIcon()}
        <span className="text-white/70">
          {t('timePatterns.peakPerson', { period: peakPeriodTranslated })}
          {timePatterns.isNightOwl && ` ${t('timePatterns.nightOwl')}`}
        </span>
      </motion.div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Hourly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-white/60 text-sm mb-4">{t('timePatterns.byHour')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2} fill="url(#hourGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-white/60 text-sm mb-4">{t('timePatterns.byDay')}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData}>
                <XAxis dataKey="day" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#FF6B9D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="glass rounded-2xl p-5">
              <p className="text-white/40 text-sm">{t('timePatterns.busiestDay')}</p>
              <p className="text-2xl font-bold text-white">{t(`timePatterns.days.${timePatterns.busiestDayKey}`)}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-white/40 text-sm">{t('timePatterns.busiestMonth')}</p>
              <p className="text-2xl font-bold text-white">{timePatterns.busiestMonth}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-white/40 text-sm">{t('timePatterns.weekdayVsWeekend')}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 bg-dark-surface rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full"
                    style={{ width: `${(timePatterns.weekdayVsWeekend.weekday / (timePatterns.weekdayVsWeekend.weekday + timePatterns.weekdayVsWeekend.weekend)) * 100}%` }}
                  />
                </div>
                <span className="text-white/50 text-xs">
                  {Math.round((timePatterns.weekdayVsWeekend.weekday / (timePatterns.weekdayVsWeekend.weekday + timePatterns.weekdayVsWeekend.weekend)) * 100)}% {t('timePatterns.weekday')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
