import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  nextLabel?: string;
}

export default function NavigationButtons({ onPrev, onNext, canGoPrev, canGoNext, nextLabel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center items-center gap-4 px-6">
      {canGoPrev && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onPrev}
          className="flex items-center gap-2 px-5 py-3 rounded-full glass hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">{t('nav.back')}</span>
        </motion.button>
      )}

      {canGoNext && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-primary hover:opacity-90 transition-opacity text-white font-medium glow"
        >
          <span className="text-sm">{nextLabel || t('nav.next')}</span>
          <ChevronRight size={18} />
        </motion.button>
      )}
    </div>
  );
}
