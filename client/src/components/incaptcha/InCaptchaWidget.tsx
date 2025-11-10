import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Timer } from './Timer';
import { ImageSelectMode } from './ImageSelectMode';
import { PuzzleMode } from './PuzzleMode';
import { SuccessAnimation } from './SuccessAnimation';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface InCaptchaWidgetProps {
  siteKey: string;
  onSuccess?: (verifyToken: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

interface ChallengeData {
  challengeId: string;
  prompt: string;
  images: string[];
  challengeToken: string;
  mode: 'images' | 'puzzle';
  puzzleData?: {
    backgroundImage: string;
    puzzlePiece: string;
    correctX: number;
    correctY: number;
  };
}

interface SolveResponse {
  success: boolean;
  verifyToken?: string;
  score?: number;
  message?: string;
}

export function InCaptchaWidget({
  siteKey,
  onSuccess,
  onError,
  onExpire
}: InCaptchaWidgetProps) {
  const { theme } = useTheme();
  const [state, setState] = useState<'loading' | 'challenge' | 'verifying' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [successScore, setSuccessScore] = useState(0);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const { behaviorVector, generateBehaviorVector } = useBehaviorTracking(state === 'challenge');

  // Start challenge mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<ChallengeData>('POST', '/api/incaptcha/start', {
        siteKey,
        theme,
      });
    },
    onSuccess: (data) => {
      setChallenge(data);
      setState('challenge');
    },
    onError: (error: any) => {
      handleError('Failed to load challenge. Please refresh.');
    },
  });

  // Solve mutation
  const solveMutation = useMutation({
    mutationFn: async (data: {
      challengeId: string;
      challengeToken: string;
      selectedIndices: number[];
      behaviorVector: number[];
    }) => {
      return apiRequest<SolveResponse>('POST', '/api/incaptcha/solve', data);
    },
    onSuccess: (data) => {
      if (data.success && data.verifyToken) {
        setSuccessScore(data.score || 85);
        setState('success');
        onSuccess?.(data.verifyToken);
      } else {
        handleError(data.message || 'Verification failed. Please try again.');
      }
    },
    onError: (error: any) => {
      handleError(error.message || 'Network error. Please try again.');
    },
  });

  useEffect(() => {
    if (state === 'loading' && !startMutation.isPending && !challenge) {
      startMutation.mutate();
    }
  }, [state]);

  const handleError = useCallback((message: string) => {
    setErrorMessage(message);
    setState('error');
    onError?.(message);
  }, [onError]);

  const handleExpire = useCallback(() => {
    handleError('Challenge expired. Please try again.');
    onExpire?.();
    setTimeout(() => {
      setChallenge(null);
      setState('loading');
    }, 2000);
  }, [onExpire]);

  const handleSubmit = useCallback(async (selectedIndices: number[]) => {
    if (!challenge) return;

    setState('verifying');
    const behaviorData = generateBehaviorVector();

    solveMutation.mutate({
      challengeId: challenge.challengeId,
      challengeToken: challenge.challengeToken,
      selectedIndices,
      behaviorVector: behaviorData,
    });
  }, [challenge, generateBehaviorVector, solveMutation]);

  const handlePuzzleSubmit = useCallback((isCorrect: boolean, accuracy: number) => {
    if (!challenge || !isCorrect) return;
    handleSubmit([accuracy]);
  }, [challenge, handleSubmit]);

  const handleRetry = useCallback(() => {
    setState('loading');
    setErrorMessage('');
    setChallenge(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-md mx-auto"
      data-testid="incaptcha-widget"
    >
      <Card className={`relative overflow-hidden ${
        theme === 'macos' 
          ? 'bg-card/80 backdrop-blur-xl border-card-border shadow-lg' 
          : 'bg-card border-card-border shadow-md'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="w-6 h-6 text-primary" strokeWidth={2} />
              {theme === 'macos' && (
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">InCaptcha</h2>
              <p className="text-xs text-muted-foreground">Human Verification</p>
            </div>
          </div>

          {state === 'challenge' && challenge && (
            <Timer duration={60} onExpire={handleExpire} />
          )}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading challenge...</p>
              </motion.div>
            )}

            {state === 'challenge' && challenge && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                {challenge.mode === 'images' ? (
                  <ImageSelectMode
                    images={challenge.images}
                    prompt={challenge.prompt}
                    onSubmit={handleSubmit}
                    disabled={state === 'verifying'}
                  />
                ) : challenge.puzzleData ? (
                  <PuzzleMode
                    backgroundImage={challenge.puzzleData.backgroundImage}
                    puzzlePiece={challenge.puzzleData.puzzlePiece}
                    correctX={challenge.puzzleData.correctX}
                    correctY={challenge.puzzleData.correctY}
                    onSubmit={handlePuzzleSubmit}
                    disabled={state === 'verifying'}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Invalid challenge mode</p>
                  </div>
                )}
              </motion.div>
            )}

            {state === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Verifying your response...</p>
              </motion.div>
            )}

            {state === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SuccessAnimation score={successScore} />
              </motion.div>
            )}

            {state === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <AlertCircle className="w-12 h-12 text-destructive" />
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Verification Failed
                  </h3>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover-elevate active-elevate-2 mt-2"
                  data-testid="button-retry"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Protected by InCaptcha</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
