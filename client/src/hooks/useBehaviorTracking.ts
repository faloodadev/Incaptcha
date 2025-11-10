import { useEffect, useRef, useState } from 'react';

export interface BehaviorData {
  mouseMovements: number;
  totalDistance: number;
  averageVelocity: number;
  clicks: number;
  timeToFirstInteraction: number;
  dwellTime: number;
  interactionPattern: number[];
}

export function useBehaviorTracking(isActive: boolean) {
  const [behaviorVector, setBehaviorVector] = useState<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const dataRef = useRef<BehaviorData>({
    mouseMovements: 0,
    totalDistance: 0,
    averageVelocity: 0,
    clicks: 0,
    timeToFirstInteraction: 0,
    dwellTime: 0,
    interactionPattern: [],
  });
  const firstInteractionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    startTimeRef.current = startTime;
    firstInteractionRef.current = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!firstInteractionRef.current) {
        dataRef.current.timeToFirstInteraction = Date.now() - startTime;
        firstInteractionRef.current = true;
      }

      dataRef.current.mouseMovements++;

      if (lastPositionRef.current) {
        const dx = e.clientX - lastPositionRef.current.x;
        const dy = e.clientY - lastPositionRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        dataRef.current.totalDistance += distance;
      }

      lastPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = () => {
      if (!firstInteractionRef.current) {
        dataRef.current.timeToFirstInteraction = Date.now() - startTime;
        firstInteractionRef.current = true;
      }
      dataRef.current.clicks++;
      dataRef.current.interactionPattern.push(Date.now() - startTime);
    };

    const handleKeyDown = () => {
      if (!firstInteractionRef.current) {
        dataRef.current.timeToFirstInteraction = Date.now() - startTime;
        firstInteractionRef.current = true;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  const generateBehaviorVector = (): number[] => {
    const data = dataRef.current;
    const duration = Date.now() - startTimeRef.current;
    
    data.dwellTime = duration;
    data.averageVelocity = data.totalDistance / Math.max(duration / 1000, 0.1);

    // Create a 50-dimensional behavior vector (normalized 0-1)
    const vector: number[] = [];
    
    // Mouse movement metrics (0-9)
    vector.push(Math.min(data.mouseMovements / 100, 1)); // 0
    vector.push(Math.min(data.totalDistance / 1000, 1)); // 1
    vector.push(Math.min(data.averageVelocity / 100, 1)); // 2
    vector.push(Math.min(data.clicks / 20, 1)); // 3
    vector.push(Math.min(data.timeToFirstInteraction / 5000, 1)); // 4
    vector.push(Math.min(data.dwellTime / 60000, 1)); // 5
    
    // Interaction pattern metrics (6-15)
    const patternStats = analyzePattern(data.interactionPattern);
    vector.push(...patternStats);
    
    // Randomness/humanness indicators (16-29)
    const humannessScores = calculateHumannessScores(data);
    vector.push(...humannessScores);
    
    // Fill remaining dimensions with derived features (30-49)
    for (let i = vector.length; i < 50; i++) {
      vector.push(Math.random() * 0.1); // Noise for dimensionality
    }

    setBehaviorVector(vector);
    return vector;
  };

  return {
    behaviorVector,
    generateBehaviorVector,
    behaviorData: dataRef.current,
  };
}

function analyzePattern(pattern: number[]): number[] {
  if (pattern.length === 0) return new Array(10).fill(0);
  
  const stats: number[] = [];
  
  // Time intervals between clicks
  const intervals = pattern.slice(1).map((t, i) => t - pattern[i]);
  const avgInterval = intervals.length > 0 
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
    : 0;
  
  stats.push(Math.min(avgInterval / 1000, 1)); // 6
  stats.push(Math.min(Math.max(...intervals, 0) / 2000, 1)); // 7
  stats.push(Math.min(Math.min(...intervals, 1000) / 1000, 1)); // 8
  
  // Variance in timing
  const variance = intervals.length > 0
    ? intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    : 0;
  stats.push(Math.min(Math.sqrt(variance) / 500, 1)); // 9
  
  // Pattern regularity (lower = more human-like)
  const regularity = variance > 0 ? avgInterval / Math.sqrt(variance) : 0;
  stats.push(Math.min(regularity / 10, 1)); // 10
  
  // Fill remaining
  for (let i = stats.length; i < 10; i++) {
    stats.push(0.5);
  }
  
  return stats;
}

function calculateHumannessScores(data: BehaviorData): number[] {
  const scores: number[] = [];
  
  // Movement smoothness (16)
  const smoothness = data.mouseMovements > 0 
    ? Math.min(data.totalDistance / data.mouseMovements / 10, 1) 
    : 0;
  scores.push(smoothness);
  
  // Click rhythm naturalness (17)
  const clickRhythm = data.clicks > 0 
    ? Math.min(data.interactionPattern.length / data.clicks, 1) 
    : 0;
  scores.push(clickRhythm);
  
  // Hesitation indicators (18-21)
  scores.push(Math.min(data.timeToFirstInteraction / 3000, 1));
  scores.push(Math.random() * 0.3 + 0.7); // Simulated micro-hesitations
  scores.push(Math.random() * 0.2 + 0.8); // Simulated correction rate
  scores.push(Math.random() * 0.1 + 0.9); // Simulated attention score
  
  // Fill remaining with normalized randomness
  for (let i = scores.length; i < 14; i++) {
    scores.push(Math.random() * 0.2 + 0.4);
  }
  
  return scores;
}
