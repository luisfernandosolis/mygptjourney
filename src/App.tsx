import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useJourney } from './hooks/useJourney';
import ParticleBackground from './components/ui/ParticleBackground';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import ProgressBar from './components/ui/ProgressBar';
import NavigationButtons from './components/ui/NavigationButtons';
import FileUpload from './components/FileUpload';
import LoadingScreen from './components/LoadingScreen';
import WelcomeScreen from './components/screens/WelcomeScreen';
import OverviewScreen from './components/screens/OverviewScreen';
import TimePatternsScreen from './components/screens/TimePatternsScreen';
import TopicsScreen from './components/screens/TopicsScreen';
import CategoriesScreen from './components/screens/CategoriesScreen';
import PersonalityScreen from './components/screens/PersonalityScreen';
import AchievementsScreen from './components/screens/AchievementsScreen';
import WordCloudScreen from './components/screens/WordCloudScreen';
import MoodJourneyScreen from './components/screens/MoodJourneyScreen';
import EvolutionScreen from './components/screens/EvolutionScreen';
import PowerMetricsScreen from './components/screens/PowerMetricsScreen';
import TimeMachineScreen from './components/screens/TimeMachineScreen';
import FunFactsScreen from './components/screens/FunFactsScreen';
import SummaryScreen from './components/screens/SummaryScreen';
import type { JourneyScreen } from './types/chatgpt';
import { useEffect, useCallback } from 'react';

const screenVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -40, scale: 0.98 },
};

export default function App() {
  const { t } = useTranslation();
  const {
    screen,
    analytics,
    error,
    loadingMessage,
    currentScreenIndex,
    totalScreens,
    processFile,
    nextScreen,
    prevScreen,
    resetJourney,
  } = useJourney();

  const isJourneyScreen = screen !== 'upload' && screen !== 'loading';

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isJourneyScreen) return;
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isTyping) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextScreen();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevScreen();
    }
  }, [isJourneyScreen, nextScreen, prevScreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderScreen = (currentScreen: JourneyScreen) => {
    if (!analytics) return null;

    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen analytics={analytics} />;
      case 'overview': return <OverviewScreen analytics={analytics} />;
      case 'time-patterns': return <TimePatternsScreen analytics={analytics} />;
      case 'topics': return <TopicsScreen analytics={analytics} />;
      case 'categories': return <CategoriesScreen analytics={analytics} />;
      case 'personality': return <PersonalityScreen analytics={analytics} />;
      case 'achievements': return <AchievementsScreen analytics={analytics} />;
      case 'word-cloud': return <WordCloudScreen analytics={analytics} />;
      case 'mood-journey': return <MoodJourneyScreen analytics={analytics} />;
      case 'evolution': return <EvolutionScreen analytics={analytics} />;
      case 'power-metrics': return <PowerMetricsScreen analytics={analytics} />;
      case 'time-machine': return <TimeMachineScreen analytics={analytics} />;
      case 'fun-facts': return <FunFactsScreen analytics={analytics} />;
      case 'summary': return <SummaryScreen analytics={analytics} onReset={resetJourney} />;
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Progress bar for journey screens */}
      {isJourneyScreen && (
        <ProgressBar current={currentScreenIndex} total={totalScreens} />
      )}

      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="relative z-10"
        >
          {screen === 'upload' && (
            <FileUpload onFileSelect={processFile} error={error} />
          )}

          {screen === 'loading' && (
            <LoadingScreen message={loadingMessage} />
          )}

          {isJourneyScreen && renderScreen(screen)}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {isJourneyScreen && screen !== 'summary' && (
        <NavigationButtons
          onPrev={prevScreen}
          onNext={nextScreen}
          canGoPrev={currentScreenIndex > 0}
          canGoNext={currentScreenIndex < totalScreens - 1}
          nextLabel={currentScreenIndex === totalScreens - 2 ? t('nav.seeSummary') : t('nav.next')}
        />
      )}
    </div>
  );
}
