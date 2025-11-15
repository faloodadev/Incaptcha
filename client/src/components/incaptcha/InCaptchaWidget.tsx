import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, AlertCircle, Sparkles } from 'lucide-react';
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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.3 }
      }}
      className="w-full max-w-md mx-auto"
      data-testid="incaptcha-widget"
    >
      <div className="relative holo-border-animated rounded-xl overflow-hidden shadow-2xl">
        <Card className="relative overflow-hidden border-0 glass-strong backdrop-blur-2xl">
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-3xl opacity-50 animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 via-transparent to-primary/10 blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Header with Glassmorphism */}
          <div className="relative flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              <div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  InCaptcha
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </h2>
                <p className="text-xs text-muted-foreground">AI-Powered Verification</p>
              </div>
            </div>

            {state === 'challenge' && challenge && (
              <Timer duration={60} onExpire={handleExpire} />
            )}
          </div>

          {/* Content with Smooth Transitions */}
          <div className="relative p-6 min-h-[420px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {state === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50" />
                    <Loader2 className="relative w-12 h-12 text-primary" />
                  </motion.div>
                  <motion.p 
                    className="text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Initializing verification...
                  </motion.p>
                </motion.div>
              )}

              {state === 'challenge' && challenge && (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25,
                    opacity: { duration: 0.2 }
                  }}
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-full blur-lg opacity-60" />
                    <Loader2 className="relative w-12 h-12 text-primary" />
                  </motion.div>
                  <motion.div className="text-center">
                    <motion.p 
                      className="text-sm font-medium text-foreground mb-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Analyzing response...
                    </motion.p>
                    <p className="text-xs text-muted-foreground">AI verification in progress</p>
                  </motion.div>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 20 
                  }}
                >
                  <SuccessAnimation score={successScore} />
                </motion.div>
              )}

              {state === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
                    <AlertCircle className="relative w-12 h-12 text-destructive" />
                  </motion.div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      Verification Failed
                    </h3>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                  </div>
                  <motion.button
                    onClick={handleRetry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium shadow-lg overflow-hidden group mt-2"
                    data-testid="button-retry"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">Try Again</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with Holographic Accent */}
          <div className="relative px-4 py-3 border-t border-white/10 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span>Protected by</span>
                <span className="gradient-text font-semibold">InCaptcha</span>
              </span>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary"
                />
                <span className="text-primary font-medium">Secure</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
