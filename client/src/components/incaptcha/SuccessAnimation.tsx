import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SuccessAnimationProps {
  score: number;
}

export function SuccessAnimation({ score }: SuccessAnimationProps) {
  const { theme } = useTheme();

  useEffect(() => {
    // Futuristic holographic confetti
    const colors = ['#8B5CF6', '#06B6D4', '#A78BFA', '#22D3EE', '#C084FC'];

    // First burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
      ticks: 200,
      gravity: 0.8,
      scalar: 1.2,
    });

    // Delayed second burst for depth
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.6 },
        colors,
        disableForReducedMotion: true,
        ticks: 150,
        gravity: 0.6,
        scalar: 0.8,
      });
    }, 150);
  }, [theme]);

  return (
    <div className="relative">
      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20 
        }}
        className="relative flex flex-col items-center justify-center gap-6 p-8"
        data-testid="success-animation"
      >
        {/* Success Icon with Holographic Ring */}
        <div className="relative">
          {/* Rotating Holographic Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 -m-4"
          >
            <div className="w-32 h-32 rounded-full border-2 border-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-clip-border opacity-30" style={{
              backgroundSize: '200% 200%',
            }} />
          </motion.div>

          {/* Pulsing Glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl"
          />

          {/* Success Icon */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ 
              delay: 0.1,
              type: 'spring', 
              stiffness: 250, 
              damping: 15 
            }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary to-secondary p-6 rounded-full shadow-2xl">
              <CheckCircle2 
                className="w-12 h-12 text-white" 
                strokeWidth={2.5}
              />
            </div>
          </motion.div>

          {/* Sparkle Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, (i - 1) * 40],
                y: [0, -30 - i * 10]
              }}
              transition={{ 
                duration: 1.5,
                delay: 0.3 + i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
            </motion.div>
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3 relative z-10">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="text-2xl font-bold gradient-text"
            data-testid="text-success-title"
          >
            Verification Complete
          </motion.h3>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span>Identity confirmed as human</span>
          </motion.div>

          {/* Score Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2"
          >
            <div className="relative glass-strong px-5 py-2.5 rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm" />
              <div className="relative flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono font-bold gradient-text" data-testid="text-score">
                  Trust Score: {score}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              y: [0, -100],
              x: [(i - 2) * 30, (i - 2) * 30 + (Math.random() - 0.5) * 40]
            }}
            transition={{ 
              duration: 2 + i * 0.3,
              delay: 0.5 + i * 0.2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute bottom-0 left-1/2 w-1 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        ))}
      </motion.div>
    </div>
  );
}
