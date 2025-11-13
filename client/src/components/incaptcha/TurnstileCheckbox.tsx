import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TurnstileCheckboxProps {
  onSuccess?: (verifyToken: string) => void;
  onError?: (error: string) => void;
  siteKey?: string;
}

export function TurnstileCheckbox({ onSuccess, onError, siteKey = 'demo_site_key' }: TurnstileCheckboxProps) {
  const [state, setState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ success: boolean; verifyToken?: string }>('POST', '/api/incaptcha/turnstile/verify', {
        siteKey,
        behaviorVector: {},
      });
    },
    onSuccess: (data) => {
      if (data.success && data.verifyToken) {
        setState('success');
        onSuccess?.(data.verifyToken);
      } else {
        setState('error');
        onError?.('Verification failed');
        setTimeout(() => setState('idle'), 2000);
      }
    },
    onError: () => {
      setState('error');
      onError?.('Verification failed');
      setTimeout(() => setState('idle'), 2000);
    },
  });

  const handleClick = useCallback(async () => {
    if (state !== 'idle') return;
    setState('verifying');
    verifyMutation.mutate();
  }, [state, verifyMutation]);

  return (
    <div className="w-full max-w-[300px] bg-[#f9fafb] dark:bg-card border border-[#d4d9e3] dark:border-border rounded shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <button
              onClick={handleClick}
              disabled={state !== 'idle'}
              className={`relative flex items-center justify-center w-[28px] h-[28px] border-2 rounded transition-all ${
                state === 'success'
                  ? 'bg-[#2bb673] border-[#2bb673]'
                  : state === 'verifying'
                  ? 'bg-white dark:bg-background border-[#d0d0d0] dark:border-border'
                  : 'bg-white dark:bg-background border-[#d0d0d0] dark:border-border hover:border-[#b0b0b0]'
              }`}
              data-testid="checkbox-human"
              aria-pressed={state === 'success'}
            >
              <AnimatePresence mode="wait">
                {state === 'verifying' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="w-4 h-4 text-[#5865F2] animate-spin" />
                  </motion.div>
                )}
                {state === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Label */}
            <span className="text-[15px] font-normal text-[#1f2937] dark:text-foreground">
              I am human
            </span>
          </div>

          {/* Turnstile Logo */}
          <div className="flex items-center gap-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#5865F2]">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Privacy & Terms */}
      <div className="border-t border-[#e5e7eb] dark:border-border px-4 py-2.5 flex items-center gap-1.5 text-[11px] text-[#6b7280] dark:text-muted-foreground">
        <button className="hover:underline" data-testid="link-privacy">Privacy</button>
        <span>-</span>
        <button className="hover:underline" data-testid="link-terms">Terms</button>
      </div>
    </div>
  );
}
