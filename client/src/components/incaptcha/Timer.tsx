import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

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

  return (
    <div className="relative flex items-center gap-2" data-testid="timer-container">
      <Clock className={`w-4 h-4 ${isWarning ? 'text-destructive' : 'text-muted-foreground'}`} />
      <div className="relative w-32 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isWarning ? 'bg-destructive' : 'bg-primary'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span
        className={`text-sm font-mono tabular-nums ${
          isWarning ? 'text-destructive font-semibold' : 'text-foreground'
        }`}
        data-testid="timer-display"
      >
        {timeLeft}s
      </span>
    </div>
  );
}
