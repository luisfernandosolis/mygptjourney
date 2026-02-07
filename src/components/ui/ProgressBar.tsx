import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-dark-surface">
      <motion.div
        className="h-full bg-gradient-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <div className="absolute right-4 top-3 text-xs text-white/40 font-mono">
        {current + 1} / {total}
      </div>
    </div>
  );
}
