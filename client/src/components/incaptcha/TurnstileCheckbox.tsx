import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Mock hook for behavior tracking, to be replaced with actual implementation
const useBehaviorTracking = () => {
  const mouseTrajectory = useRef<MouseSample[]>([]);
  const hoverStartTime = useRef<number>(0);
  const pageLoadTime = useRef<number>(Date.now());
  const lastScrollY = useRef<number>(window.scrollY);
  const lastScrollTime = useRef<number>(Date.now());

  const startTracking = useCallback(() => {
    // In a real scenario, this would add event listeners for mouse, scroll, etc.
    // For this example, we'll assume these are managed elsewhere or by the component itself
  }, []);

  const generateBehaviorVector = useCallback((): BehaviorVector => {
    const now = Date.now();
    const scrollVelocity = lastScrollTime.current > 0 
      ? (window.scrollY - lastScrollY.current) / ((now - lastScrollTime.current) / 1000)
      : 0;

    // Calculate average mouse velocity
    let totalVelocity = 0;
    for (let i = 1; i < mouseTrajectory.current.length; i++) {
      const prev = mouseTrajectory.current[i - 1];
      const curr = mouseTrajectory.current[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dt = (curr.t - prev.t) / 1000; // seconds
      if (dt > 0) {
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
        totalVelocity += velocity;
      }
    }
    const avgVelocity = mouseTrajectory.current.length > 1 
      ? totalVelocity / (mouseTrajectory.current.length - 1) 
      : 0;

    return {
      mouseTrajectory: mouseTrajectory.current.slice(-20), // Last 20 samples
      clickLatency: now - pageLoadTime.current,
      hoverDuration: hoverStartTime.current > 0 ? now - hoverStartTime.current : 0,
      mouseVelocity: avgVelocity,
      timestamp: now,
      scrollBehavior: {
        scrollY: window.scrollY,
        scrollVelocity: scrollVelocity
      }
    };
  }, []);

  return { startTracking, generateBehaviorVector };
};


interface MouseSample {
  t: number;
  x: number;
  y: number;
}

interface BehaviorVector {
  mouseTrajectory: MouseSample[];
  clickLatency: number;
  hoverDuration: number;
  mouseVelocity: number;
  timestamp: number;
  scrollBehavior: { scrollY: number; scrollVelocity: number };
}

interface TurnstileCheckboxProps {
  onSuccess?: (verifyToken: string) => void;
  onError?: (error: string) => void;
  siteKey?: string;
}

export function TurnstileCheckbox({ onSuccess, onError, siteKey = 'demo_site_key' }: TurnstileCheckboxProps) {
  const [state, setState] = useState<'idle' | 'prechecked' | 'verifying' | 'success' | 'error' | 'challenge'>('idle');
  const resetTimerRef = useRef<number | null>(null);

  // Behavioral tracking state
  const mouseTrajectory = useRef<MouseSample[]>([]);
  const hoverStartTime = useRef<number>(0);
  const pageLoadTime = useRef<number>(Date.now());
  const checkboxRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(window.scrollY);
  const lastScrollTime = useRef<number>(Date.now());

  // Calculate behavioral metrics
  const getBehaviorVector = useCallback((): BehaviorVector => {
    const now = Date.now();
    const scrollVelocity = lastScrollTime.current > 0 
      ? (window.scrollY - lastScrollY.current) / ((now - lastScrollTime.current) / 1000)
      : 0;

    // Calculate average mouse velocity
    let totalVelocity = 0;
    for (let i = 1; i < mouseTrajectory.current.length; i++) {
      const prev = mouseTrajectory.current[i - 1];
      const curr = mouseTrajectory.current[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dt = (curr.t - prev.t) / 1000; // seconds
      if (dt > 0) {
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
        totalVelocity += velocity;
      }
    }
    const avgVelocity = mouseTrajectory.current.length > 1 
      ? totalVelocity / (mouseTrajectory.current.length - 1) 
      : 0;

    return {
      mouseTrajectory: mouseTrajectory.current.slice(-20), // Last 20 samples
      clickLatency: now - pageLoadTime.current,
      hoverDuration: hoverStartTime.current > 0 ? now - hoverStartTime.current : 0,
      mouseVelocity: avgVelocity,
      timestamp: now,
      scrollBehavior: {
        scrollY: window.scrollY,
        scrollVelocity: scrollVelocity
      }
    };
  }, []);

  // Verification mutation with challenge escalation
  const verifyMutation = useMutation({
    mutationFn: async (behaviorData: any) => {
      return apiRequest<{ 
        success: boolean; 
        verifyToken?: string; 
        score?: number;
        requiresChallenge?: boolean;
        challengeType?: string;
        challengeId?: string;
        challengeToken?: string;
        riskScore?: number;
      }>('POST', '/api/incaptcha/turnstile/verify', {
        siteKey,
        behaviorVector: behaviorData,
      });
    },
    onSuccess: (data) => {
      if (data.requiresChallenge && data.challengeType === 'jigsaw') {
        // Escalate to jigsaw puzzle challenge
        setState('challenge');
        // Store challenge data for puzzle component
        (window as any).__jigsawChallengeData = {
          challengeId: data.challengeId,
          challengeToken: data.challengeToken,
          riskScore: data.riskScore,
        };
      } else if (data.success && data.verifyToken) {
        setState('success');
        console.log('Verification successful! Token:', data.verifyToken);
        onSuccess?.(data.verifyToken);
      } else {
        setState('error');
        onError?.('Verification failed');
        // Auto-reset to idle after 2 seconds
        resetTimerRef.current = window.setTimeout(() => {
          setState('idle');
        }, 2000);
      }
    },
    onError: () => {
      setState('error');
      onError?.('Verification request failed');
      // Auto-reset to idle after 2 seconds
      resetTimerRef.current = window.setTimeout(() => {
        setState('idle');
      }, 2000);
    },
  });

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    mouseTrajectory.current.push({
      t: now,
      x: e.clientX,
      y: e.clientY
    });

    // Keep only last 50 samples to avoid memory issues
    if (mouseTrajectory.current.length > 50) {
      mouseTrajectory.current = mouseTrajectory.current.slice(-50);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    hoverStartTime.current = Date.now();
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverStartTime.current = 0;
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // Handle jigsaw puzzle completion
  const handleJigsawComplete = useCallback(async (accuracy: number) => {
    const challengeData = (window as any).__jigsawChallengeData;
    if (!challengeData) return;

    try {
      // Convert accuracy (0-1 range) to a score multiplier
      const accuracyScore = Math.round(accuracy * 100);
      
      const response = await apiRequest<{ success: boolean; verifyToken?: string; score?: number }>('POST', '/api/incaptcha/solve', {
        challengeId: challengeData.challengeId,
        challengeToken: challengeData.challengeToken,
        selectedIndices: [accuracyScore],
        behaviorVector: getBehaviorVector(),
      });

      if (response.success && response.verifyToken) {
        setState('success');
        onSuccess?.(response.verifyToken);
      } else {
        setState('error');
        onError?.(response.message || 'Puzzle verification failed');
        // Auto-reset after 2 seconds
        setTimeout(() => {
          setState('idle');
          delete (window as any).__jigsawChallengeData;
        }, 2000);
      }
    } catch (error) {
      setState('error');
      onError?.('Puzzle verification failed');
      // Auto-reset after 2 seconds
      setTimeout(() => {
        setState('idle');
        delete (window as any).__jigsawChallengeData;
      }, 2000);
    }
  }, [getBehaviorVector, onSuccess, onError]);

  const handleClick = useCallback(() => {
    if (state !== 'idle') return;

    // Clear any existing timer
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    // Show prechecked state immediately
    setState('prechecked');

    // After 150ms, transition to verifying and start mutation
    setTimeout(() => {
      setState('verifying');
      verifyMutation.mutate(getBehaviorVector()); // Pass behavior vector to mutation
    }, 150);
  }, [state, verifyMutation, getBehaviorVector]);

  // Show jigsaw puzzle if challenge required
  if (state === 'challenge') {
    const challengeData = (window as any).__jigsawChallengeData;
    
    const SimplePuzzle = ({ onComplete, onRefresh }: any) => {
      const [isCompleting, setIsCompleting] = useState(false);

      const handleSolve = () => {
        setIsCompleting(true);
        // Simulate puzzle solving with high accuracy (90-95%)
        const accuracy = 0.90 + Math.random() * 0.05;
        setTimeout(() => {
          onComplete(accuracy);
        }, 500);
      };

      return (
        <div className="inline-block">
          <div className="w-full max-w-[300px] bg-[#f9fafb] dark:bg-card border border-[#d4d9e3] dark:border-border rounded shadow-sm">
            <div className="p-6 text-center">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Additional Verification Required
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Complete the puzzle to verify you're human
              </p>
              
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 mb-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-16 h-16 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSolve}
                disabled={isCompleting}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isCompleting ? 'Verifying...' : 'Complete Puzzle'}
              </button>
              
              <button
                onClick={onRefresh}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
              >
                Try checkbox again
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <SimplePuzzle
        onComplete={handleJigsawComplete}
        onRefresh={() => {
          setState('idle');
          delete (window as any).__jigsawChallengeData;
        }}
      />
    );
  }

  return (
    <div className="inline-block">
      <div className="w-full max-w-[300px] bg-[#f9fafb] dark:bg-card border border-[#d4d9e3] dark:border-border rounded shadow-sm"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <button
                onClick={handleClick}
                disabled={state !== 'idle'}
                className={`
                  relative flex items-center justify-center w-[28px] h-[28px] border-2 rounded
                  transition-all duration-200 ease-out
                  ${state === 'idle' ? 'bg-white dark:bg-background border-[#e1e5f0] dark:border-border hover:border-[#b0b0b0] cursor-pointer' : ''}
                  ${state === 'prechecked' ? 'bg-white dark:bg-background border-[#4b7cf5] cursor-pointer' : ''}
                  ${state === 'verifying' ? 'bg-[#4b7cf5] border-[#4b7cf5] cursor-not-allowed' : ''}
                  ${state === 'success' ? 'bg-[#2cb77d] border-[#2cb77d] cursor-not-allowed' : ''}
                  ${state === 'error' ? 'bg-[#f87171] border-[#f87171] cursor-not-allowed' : ''}
                `}
                data-testid="checkbox-human"
                aria-pressed={state === 'success'}
                aria-busy={state === 'verifying'}
                aria-invalid={state === 'error'}
              >
                <AnimatePresence mode="wait">
                  {state === 'prechecked' && (
                    <motion.div
                      key="prechecked"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                    >
                      <Check className="w-4 h-4 text-[#4b7cf5]" strokeWidth={3} />
                    </motion.div>
                  )}
                  {state === 'verifying' && (
                    <motion.div
                      key="verifying"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </motion.div>
                  )}
                  {state === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25, duration: 0.2 }}
                    >
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                  {state === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Label */}
              <span className="text-[15px] font-normal text-[#1f2937] dark:text-foreground">
                I am human
              </span>
            </div>

            {/* InCaptcha Logo */}
            <div className="flex-shrink-0">
              <motion.div
                animate={
                  state === 'verifying'
                    ? { rotate: 360 }
                    : { rotate: 0 }
                }
                transition={
                  state === 'verifying'
                    ? { duration: 2, repeat: Infinity, ease: 'linear' }
                    : { duration: 0.3 }
                }
              >
                <img 
                  src="/incaptcha.png" 
                  alt="InCaptcha" 
                  className="h-8 w-auto"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5e9f2] dark:border-border px-4 py-2.5 bg-[#fafbfc] dark:bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280] dark:text-muted-foreground">
            <button 
              className="hover:underline" 
              onClick={(e) => e.preventDefault()}
              data-testid="link-privacy"
            >
              Privacy
            </button>
            <span>-</span>
            <button 
              className="hover:underline"
              onClick={(e) => e.preventDefault()}
              data-testid="link-terms"
            >
              Terms
            </button>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/incaptcha.png" 
              alt="InCaptcha" 
              className="h-5 w-auto"
            />
            <span className="text-[12px] font-semibold text-[#4a5466] dark:text-muted-foreground">
              InCaptcha
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}