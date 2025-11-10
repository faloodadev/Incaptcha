import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SuccessAnimationProps {
  score: number;
}

export function SuccessAnimation({ score }: SuccessAnimationProps) {
  const { theme } = useTheme();

  useEffect(() => {
    // Trigger confetti animation
    const colors = theme === 'discord' 
      ? ['#5865F2', '#7289DA', '#99AAB5'] // Discord blues
      : ['#F59E0B', '#F97316', '#FB923C']; // Saffron/warm colors

    confetti({
      particleCount: theme === 'discord' ? 50 : 80,
      spread: theme === 'discord' ? 60 : 90,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
    });
  }, [theme]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20 
      }}
      className="flex flex-col items-center justify-center gap-4 p-8"
      data-testid="success-animation"
    >
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ 
          delay: 0.1,
          type: 'spring', 
          stiffness: 200, 
          damping: 15 
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.3, 0.5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: 'easeInOut'
            }}
          />
          <CheckCircle2 
            className="w-20 h-20 text-primary relative z-10" 
            strokeWidth={2.5}
          />
        </div>
      </motion.div>

      <div className="text-center space-y-2">
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground"
          data-testid="text-success-title"
        >
          Verification Successful!
        </motion.h3>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          You've been verified as human
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="inline-block px-4 py-2 bg-primary/10 rounded-full mt-2"
        >
          <span className="text-sm font-mono text-primary font-semibold" data-testid="text-score">
            Score: {score}%
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
