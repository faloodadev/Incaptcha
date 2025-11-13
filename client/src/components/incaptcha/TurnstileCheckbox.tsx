import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Loader2 } from 'lucide-react';

interface TurnstileCheckboxProps {
  onSuccess?: (verifyToken: string) => void;
  onError?: (error: string) => void;
  siteKey?: string;
}

export function TurnstileCheckbox({ onSuccess, onError, siteKey = 'demo_site_key' }: TurnstileCheckboxProps) {
  const [state, setState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [checked, setChecked] = useState(false);

  const handleClick = useCallback(async () => {
    if (state !== 'idle') return;
    
    setChecked(true);
    setState('verifying');

    // Simulate verification with behavioral analysis
    setTimeout(async () => {
      try {
        // In a real implementation, this would call the backend
        const verifyToken = `verify_${Math.random().toString(36).substring(7)}`;
        setState('success');
        onSuccess?.(verifyToken);
      } catch (error) {
        setState('error');
        setChecked(false);
        onError?.('Verification failed');
        setTimeout(() => setState('idle'), 2000);
      }
    }, 1500);
  }, [state, onSuccess, onError]);

  return (
    <div className="w-full max-w-sm bg-background border border-border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={handleClick}
            disabled={state !== 'idle'}
            className={`relative w-7 h-7 border-2 rounded transition-all ${
              state === 'success'
                ? 'bg-green-500 border-green-500'
                : state === 'verifying'
                ? 'border-primary'
                : 'border-border hover:border-primary/50'
            }`}
            data-testid="checkbox-human"
          >
            <AnimatePresence mode="wait">
              {state === 'verifying' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </motion.div>
              )}
              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Label */}
          <span className="text-sm font-medium text-foreground">I am human</span>
        </div>

        {/* Turnstile Logo */}
        <div className="flex items-center gap-1.5">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-primary">Turnstile</span>
        </div>
      </div>

      {/* Privacy & Terms */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button className="hover:underline">Privacy</button>
        <span>·</span>
        <button className="hover:underline">Terms</button>
      </div>
    </div>
  );
}
