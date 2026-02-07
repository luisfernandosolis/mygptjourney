import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParsedConversation, AnalyticsResult, JourneyScreen } from '../types/chatgpt';
import { readFileAsJSON, validateChatGPTExport, parseConversations } from '../utils/dataParser';
import { generateAnalytics } from '../utils/analytics';

const SCREENS: JourneyScreen[] = [
  'welcome',
  'overview',
  'time-patterns',
  'topics',
  'categories',
  'personality',
  'achievements',
  'word-cloud',
  'mood-journey',
  'evolution',
  'power-metrics',
  'time-machine',
  'fun-facts',
  'summary',
];

const LOADING_KEYS = [
  'loading.opening',
  'loading.processing',
  'loading.preparing',
  'loading.analyzing',
  'loading.extracting',
  'loading.discovering',
  'loading.generating',
  'loading.almostThere',
];

export function useJourney() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<JourneyScreen>('upload');
  const [conversations, setConversations] = useState<ParsedConversation[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setScreen('loading');

    let messageIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(t(LOADING_KEYS[messageIndex % LOADING_KEYS.length]));
      messageIndex++;
    }, 1200);

    try {
      setLoadingMessage(t(LOADING_KEYS[0]));

      const raw = await readFileAsJSON(file);

      if (!validateChatGPTExport(raw)) {
        clearInterval(interval);
        setError(t('errors.invalidFile'));
        setScreen('upload');
        return;
      }

      const parsed = parseConversations(raw as Parameters<typeof parseConversations>[0]);

      if (parsed.length === 0) {
        clearInterval(interval);
        setError(t('errors.noConversations'));
        setScreen('upload');
        return;
      }

      setConversations(parsed);

      // Small delay to let UI update
      await new Promise((r) => setTimeout(r, 500));

      const result = generateAnalytics(parsed);
      setAnalytics(result);

      clearInterval(interval);
      setLoadingMessage(t('loading.ready'));

      // Dramatic pause before reveal
      await new Promise((r) => setTimeout(r, 800));
      setCurrentScreenIndex(0);
      setScreen('welcome');
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : t('errors.processFailed'));
      setScreen('upload');
    }
  }, [t]);

  const nextScreen = useCallback(() => {
    const nextIndex = currentScreenIndex + 1;
    if (nextIndex < SCREENS.length) {
      setCurrentScreenIndex(nextIndex);
      setScreen(SCREENS[nextIndex]);
    }
  }, [currentScreenIndex]);

  const prevScreen = useCallback(() => {
    const prevIndex = currentScreenIndex - 1;
    if (prevIndex >= 0) {
      setCurrentScreenIndex(prevIndex);
      setScreen(SCREENS[prevIndex]);
    }
  }, [currentScreenIndex]);

  const goToScreen = useCallback((target: JourneyScreen) => {
    const index = SCREENS.indexOf(target);
    if (index !== -1) {
      setCurrentScreenIndex(index);
      setScreen(target);
    }
  }, []);

  const resetJourney = useCallback(() => {
    setScreen('upload');
    setConversations([]);
    setAnalytics(null);
    setError(null);
    setCurrentScreenIndex(0);
  }, []);

  return {
    screen,
    conversations,
    analytics,
    error,
    loadingMessage,
    currentScreenIndex,
    totalScreens: SCREENS.length,
    processFile,
    nextScreen,
    prevScreen,
    goToScreen,
    resetJourney,
    screens: SCREENS,
  };
}
