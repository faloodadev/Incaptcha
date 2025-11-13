import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

interface TimerProps {
  duration: number;
  onExpire: () => void;
}

export function Timer({ duration, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const progress = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <motion.div 
      className="relative flex items-center gap-2.5 glass rounded-lg px-3 py-2" 
      data-testid="timer-container"
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={isCritical ? { duration: 0.5, repeat: Infinity } : {}}
    >
      {/* Background Glow */}
      {isWarning && (
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/10 rounded-lg blur-sm"
        />
      )}

      <div className="relative flex items-center gap-2">
        <motion.div
          animate={isWarning ? { rotate: [0, 10, -10, 0] } : {}}
          transition={isWarning ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 } : {}}
        >
          {isCritical ? (
            <Zap className="w-4 h-4 text-destructive fill-destructive" />
          ) : (
            <Clock className={`w-4 h-4 ${isWarning ? 'text-destructive' : 'text-primary'}`} />
          )}
        </motion.div>

        {/* Progress Bar Container */}
        <div className="relative w-28 h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Background Track Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          {/* Progress Bar with Gradient */}
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${
              isCritical 
                ? 'bg-gradient-to-r from-destructive to-orange-500' 
                : isWarning 
                ? 'bg-gradient-to-r from-orange-500 to-destructive'
                : 'bg-gradient-to-r from-primary to-secondary'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Shimmer Effect */}
            {!isWarning && (
              <motion.div
                animate={{ 
                  x: ['-100%', '200%'],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            )}
          </motion.div>

          {/* Progress Glow */}
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full blur-sm ${
              isCritical 
                ? 'bg-destructive/60' 
                : isWarning 
                ? 'bg-orange-500/60'
                : 'bg-primary/60'
            }`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>

        {/* Time Display */}
        <motion.span
          className={`text-sm font-mono tabular-nums font-semibold ${
            isCritical 
              ? 'text-destructive' 
              : isWarning 
              ? 'text-orange-500'
              : 'gradient-text'
          }`}
          data-testid="timer-display"
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={isCritical ? { duration: 0.5, repeat: Infinity } : {}}
        >
          {timeLeft}s
        </motion.span>
      </div>
    </motion.div>
  );
}
