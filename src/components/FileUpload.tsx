import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileJson, Sparkles, Shield, Zap, ChevronDown } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  error: string | null;
}

export default function FileUpload({ onFileSelect, error }: Props) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70 mb-6"
        >
          <Sparkles size={14} className="text-accent-2" />
          {t('app.tagline')}
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-gradient">MyGPT</span>
          <span className="text-white">Journey</span>
        </h1>

        <p className="text-lg text-white/50 max-w-md mx-auto leading-relaxed">
          {t('app.subtitle')}
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-lg"
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/10 glow'
              : 'border-dark-border hover:border-primary/50 hover:bg-dark-surface/50'
          }`}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <motion.div
            animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-gradient-primary' : 'bg-dark-surface'}`}>
              {fileName ? <FileJson size={28} className="text-accent" /> : <Upload size={28} className="text-primary" />}
            </div>

            {fileName ? (
              <div>
                <p className="text-white font-medium">{fileName}</p>
                <p className="text-white/40 text-sm mt-1">{t('upload.processing')}</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium">
                  {t('upload.dropFile', { file: t('upload.conversationsJson') })}
                </p>
                <p className="text-white/40 text-sm mt-2">
                  {t('upload.orClick')}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex flex-wrap justify-center gap-6 max-w-xl"
      >
        {[
          { icon: <Shield size={16} />, text: t('upload.clientSide') },
          { icon: <Zap size={16} />, text: t('upload.instantAnalysis') },
          { icon: <Sparkles size={16} />, text: t('upload.insightScreens') },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.15 }}
            className="flex items-center gap-2 text-white/40 text-sm"
          >
            <span className="text-primary">{feature.icon}</span>
            {feature.text}
          </motion.div>
        ))}
      </motion.div>

      {/* How to export hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 text-center"
      >
        <details className="group">
          <summary className="flex items-center justify-center gap-2 text-white/30 text-sm cursor-pointer hover:text-white/50 transition-colors">
            <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
            {t('upload.howToExport')}
          </summary>
          <motion.div className="mt-4 text-left max-w-sm mx-auto space-y-2 text-white/40 text-sm glass-strong rounded-xl p-5">
            <p>1. {t('upload.exportStep1')}</p>
            <p>2. {t('upload.exportStep2')}</p>
            <p>3. {t('upload.exportStep3')}</p>
            <p>4. {t('upload.exportStep4')}</p>
            <p>5. {t('upload.exportStep5')}</p>
          </motion.div>
        </details>
      </motion.div>
    </div>
  );
}
