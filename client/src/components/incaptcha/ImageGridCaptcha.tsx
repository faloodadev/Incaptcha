import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Volume2, HelpCircle, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ImageGridCaptchaProps {
  onSuccess?: (verifyToken: string) => void;
  onError?: (error: string) => void;
  siteKey?: string;
}

interface ChallengeData {
  challengeId: string;
  challengeToken: string;
  prompt: string;
  images: string[];
  mode: string;
}

export function ImageGridCaptcha({ onSuccess, onError, siteKey = 'demo_site_key' }: ImageGridCaptchaProps) {
  const [state, setState] = useState<'loading' | 'challenge' | 'verifying' | 'success'>('loading');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Start challenge
  const startMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<ChallengeData>('POST', '/api/incaptcha/start', { siteKey });
    },
    onSuccess: (data) => {
      setChallenge(data);
      setState('challenge');
    },
    onError: () => {
      onError?.('Failed to load challenge');
    },
  });

  // Solve challenge
  const solveMutation = useMutation({
    mutationFn: async (data: { challengeId: string; challengeToken: string; selectedIndices: number[] }) => {
      return apiRequest<{ success: boolean; verifyToken?: string }>('POST', '/api/incaptcha/solve', {
        ...data,
        behaviorVector: {},
      });
    },
    onSuccess: (data) => {
      if (data.success && data.verifyToken) {
        setState('success');
        onSuccess?.(data.verifyToken);
      } else {
        onError?.('Verification failed');
        handleRefresh();
      }
    },
    onError: () => {
      onError?.('Verification failed');
      handleRefresh();
    },
  });

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSkip = useCallback(() => {
    if (!challenge) return;
    setState('verifying');
    solveMutation.mutate({
      challengeId: challenge.challengeId,
      challengeToken: challenge.challengeToken,
      selectedIndices: [],
    });
  }, [challenge, solveMutation]);

  const handleRefresh = useCallback(() => {
    setSelectedIndices(new Set());
    setState('loading');
    startMutation.mutate();
  }, [startMutation]);

  // Auto-start on mount
  useState(() => {
    startMutation.mutate();
  });

  return (
    <div className="w-full max-w-md bg-background border border-border rounded-md overflow-hidden">
      {/* Instruction Bar */}
      <div className="relative bg-primary/5 border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">
            {challenge?.prompt || 'Please click each image containing a truck'}
          </p>
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full right-0 mt-1 bg-popover border border-border rounded shadow-lg p-2 w-48 z-10"
                >
                  <div className="text-xs text-foreground">
                    If there are None, click Skip
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center">
          <div className="w-10 h-6 bg-background rounded-sm overflow-hidden">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 24'%3E%3Crect fill='%238B5CF6' width='40' height='24'/%3E%3C/svg%3E"
              alt="Truck icon"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-1 p-1 aspect-square bg-muted"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted-foreground/10 animate-pulse" />
            ))}
          </motion.div>
        )}

        {state === 'challenge' && challenge && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-1 p-1 bg-muted"
          >
            {challenge.images.map((imageUrl, index) => {
              const isSelected = selectedIndices.has(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleSelection(index)}
                  className="relative aspect-square overflow-hidden bg-background hover:opacity-80 transition-opacity"
                  data-testid={`image-tile-${index}`}
                >
                  <img
                    src={imageUrl}
                    alt={`Challenge image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-primary/30 border-4 border-primary flex items-center justify-center"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}

        {state === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="aspect-square bg-muted flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-8 h-8 text-primary" />
            </motion.div>
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square bg-green-500/10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar */}
      <div className="bg-muted border-t border-border px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 text-xs font-medium text-foreground hover:bg-background rounded">
            EN
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={state === 'verifying'}
            className="p-1.5 hover:bg-background rounded transition-colors"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 text-foreground" />
          </button>
          <button
            className="p-1.5 hover:bg-background rounded transition-colors"
            data-testid="button-audio"
          >
            <Volume2 className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={handleSkip}
            disabled={state === 'verifying'}
            className="ml-2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            data-testid="button-skip"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
