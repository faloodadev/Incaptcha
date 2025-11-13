import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Volume2, HelpCircle, Check, ChevronDown } from 'lucide-react';
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

  // Start challenge mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<ChallengeData>('POST', '/api/incaptcha/start', { siteKey });
    },
    onSuccess: (data) => {
      setChallenge(data);
      setSelectedIndices(new Set());
      setState('challenge');
    },
    onError: () => {
      onError?.('Failed to load challenge');
    },
  });

  // Solve challenge mutation
  const solveMutation = useMutation({
    mutationFn: async (data: { challengeId: string; challengeToken: string; selectedIndices: number[] }) => {
      return apiRequest<{ success: boolean; verifyToken?: string; score?: number }>('POST', '/api/incaptcha/solve', {
        ...data,
        behaviorVector: {},
      });
    },
    onSuccess: (data) => {
      if (data.success && data.verifyToken) {
        setState('success');
        onSuccess?.(data.verifyToken);
      } else {
        onError?.('Verification failed. Please try again.');
        handleRefresh();
      }
    },
    onError: () => {
      onError?.('Verification failed. Please try again.');
      handleRefresh();
    },
  });

  const toggleSelection = useCallback((index: number) => {
    if (state !== 'challenge') return;
    
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, [state]);

  const handleVerify = useCallback(() => {
    if (!challenge || state !== 'challenge') return;
    setState('verifying');
    solveMutation.mutate({
      challengeId: challenge.challengeId,
      challengeToken: challenge.challengeToken,
      selectedIndices: Array.from(selectedIndices),
    });
  }, [challenge, selectedIndices, solveMutation, state]);

  const handleSkip = useCallback(() => {
    if (!challenge || state !== 'challenge') return;
    setState('verifying');
    solveMutation.mutate({
      challengeId: challenge.challengeId,
      challengeToken: challenge.challengeToken,
      selectedIndices: [],
    });
  }, [challenge, solveMutation, state]);

  const handleRefresh = useCallback(() => {
    setSelectedIndices(new Set());
    setState('loading');
    startMutation.mutate();
  }, [startMutation]);

  // Auto-start on mount
  useEffect(() => {
    startMutation.mutate();
  }, []);

  return (
    <div className="w-full max-w-[390px] bg-[#f9fafb] dark:bg-card border border-[#d4d9e3] dark:border-border rounded shadow-sm overflow-hidden">
      {/* Instruction Bar */}
      <div className="relative bg-[#4a8af4] text-white px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-1">
          <p className="text-[13px] font-normal leading-tight">
            {challenge?.prompt || 'Please click each image containing a truck'}
          </p>
          <div
            className="relative flex-shrink-0"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <HelpCircle className="w-4 h-4 cursor-help" />
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full right-0 mt-1 bg-white dark:bg-popover text-[#1f2937] dark:text-foreground border border-[#d4d9e3] dark:border-border rounded shadow-lg p-2 w-44 z-10 text-xs"
                >
                  If there are None, click Skip
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Thumbnail Preview */}
        <div className="flex-shrink-0 ml-2">
          <div className="w-12 h-9 bg-white/20 rounded-sm border border-white/30 overflow-hidden flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="opacity-80">
              <path d="M17.5 11.75a.75.75 0 0 1-.75-.75v-1a.25.25 0 0 0-.25-.25h-9a.25.25 0 0 0-.25.25v1a.75.75 0 0 1-1.5 0V10A1.75 1.75 0 0 1 7.5 8.25h9A1.75 1.75 0 0 1 18.25 10v1a.75.75 0 0 1-.75.75ZM7 12.75h10v3.5H7v-3.5Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="bg-[#f0f2f5] dark:bg-muted p-1">
        <AnimatePresence mode="wait">
          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-1 aspect-square"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#d4d9e3] dark:bg-muted-foreground/10 animate-pulse" />
              ))}
            </motion.div>
          )}

          {state === 'challenge' && challenge && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-1 aspect-square"
            >
              {challenge.images.map((imageUrl, index) => {
                const isSelected = selectedIndices.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleSelection(index)}
                    className="relative aspect-square overflow-hidden bg-white dark:bg-background hover:opacity-90 transition-opacity group"
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
                        className="absolute inset-0 bg-[#4a8af4]/30 border-4 border-[#4a8af4] flex items-center justify-center"
                      >
                        <div className="w-7 h-7 bg-[#4a8af4] rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
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
              className="aspect-square bg-[#f0f2f5] dark:bg-muted flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-8 h-8 text-[#4a8af4]" />
              </motion.div>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-green-50 dark:bg-green-900/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-[#2bb673] rounded-full flex items-center justify-center shadow-xl"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="bg-[#f9fafb] dark:bg-card border-t border-[#e5e7eb] dark:border-border px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            className="px-2 py-0.5 text-xs font-medium text-[#1f2937] dark:text-foreground hover:bg-[#e5e7eb] dark:hover:bg-muted rounded flex items-center gap-0.5"
            data-testid="button-language"
          >
            EN
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            disabled={state === 'verifying'}
            className="p-1.5 hover:bg-[#e5e7eb] dark:hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-refresh"
            title="Get new challenge"
          >
            <RefreshCw className="w-4 h-4 text-[#1f2937] dark:text-foreground" />
          </button>
          
          <button
            disabled={state !== 'challenge'}
            className="p-1.5 hover:bg-[#e5e7eb] dark:hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-audio"
            title="Audio challenge"
          >
            <Volume2 className="w-4 h-4 text-[#1f2937] dark:text-foreground" />
          </button>
          
          {selectedIndices.size > 0 ? (
            <button
              onClick={handleVerify}
              disabled={state !== 'challenge'}
              className="ml-2 px-3 py-1 bg-[#4a8af4] text-white text-sm font-medium rounded hover:bg-[#3a7ae4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-verify"
            >
              Verify
            </button>
          ) : (
            <button
              onClick={handleSkip}
              disabled={state !== 'challenge'}
              className="ml-2 px-3 py-1 bg-[#4a8af4] text-white text-sm font-medium rounded hover:bg-[#3a7ae4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-skip"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
