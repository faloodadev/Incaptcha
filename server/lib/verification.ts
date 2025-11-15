// Simplified semantic verification service
// In production, this would use CLIP embeddings

export function calculateSemanticScore(
  selectedIndices: number[],
  correctIndices: number[],
  isHoneytrap: boolean
): number {
  // If it's a honeytrap and user selected incorrectly, return low score
  if (isHoneytrap && selectedIndices.length > 0) {
    return 15; // Suspicious
  }

  // Calculate similarity between selected and correct indices
  const selectedSet = new Set(selectedIndices);
  const correctSet = new Set(correctIndices);
  
  // Intersection over union (Jaccard similarity)
  const intersection = new Set(Array.from(selectedSet).filter(x => correctSet.has(x)));
  const union = new Set([...Array.from(selectedSet), ...Array.from(correctSet)]);
  
  const similarity = intersection.size / union.size;
  
  // Convert to 0-100 score
  const score = Math.round(similarity * 100);
  
  return score;
}

interface BehaviorVector {
  mouseTrajectory?: Array<{ t: number; x: number; y: number }>;
  clickLatency?: number;
  hoverDuration?: number;
  mouseVelocity?: number;
  timestamp?: number;
  scrollBehavior?: { scrollY: number; scrollVelocity: number };
}

export function calculateBehaviorScore(behaviorVector: BehaviorVector | number[]): number {
  // Handle legacy array format
  if (Array.isArray(behaviorVector)) {
    if (behaviorVector.length === 0) {
      return 30; // Lower score if no behavioral data (suspicious)
    }

    // Analyze behavioral features (legacy)
    const mouseActivity = behaviorVector[0] || 0;
    const distance = behaviorVector[1] || 0;
    const velocity = behaviorVector[2] || 0;
    const timeToFirst = behaviorVector[4] || 0;
    
    let score = 50;
    if (mouseActivity > 0.1 && mouseActivity < 0.9) score += 15;
    if (distance > 0.2 && distance < 0.95) score += 15;
    if (velocity > 0.1 && velocity < 0.7) score += 10;
    if (timeToFirst > 0.1 && timeToFirst < 0.6) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  // Handle new object format with detailed behavioral signals
  if (!behaviorVector || typeof behaviorVector !== 'object') {
    return 30; // Lower score if no behavioral data (suspicious)
  }

  let score = 50; // Base score
  let suspicionFlags = 0; // Track bot-like patterns

  // 1. Mouse trajectory analysis (30 points max) - ENHANCED AI DETECTION
  if (behaviorVector.mouseTrajectory && behaviorVector.mouseTrajectory.length > 0) {
    const trajectory = behaviorVector.mouseTrajectory;
    
    // Bot detection: Too few samples (instant click)
    if (trajectory.length < 3) {
      suspicionFlags += 2;
      score -= 25;
    }
    // Bot detection: Suspiciously many samples (scripted movement)
    else if (trajectory.length > 100) {
      suspicionFlags += 1;
      score -= 10;
    }
    // Humans have natural mouse movements (5-50 samples is normal)
    else if (trajectory.length >= 5 && trajectory.length <= 50) {
      score += 10;
    }
    
    // Calculate trajectory curvature (humans don't move in perfect straight lines)
    let totalCurvature = 0;
    let perfectLineSegments = 0;
    
    for (let i = 1; i < trajectory.length - 1; i++) {
      const prev = trajectory[i - 1];
      const curr = trajectory[i];
      const next = trajectory[i + 1];
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const curvature = Math.abs(angle2 - angle1);
      totalCurvature += curvature;
      
      // Bot detection: Perfect straight line segments
      if (curvature < 0.01) {
        perfectLineSegments++;
      }
    }
    
    // Too many perfect segments = bot
    if (perfectLineSegments > trajectory.length * 0.7) {
      suspicionFlags += 2;
      score -= 20;
    }
    
    const avgCurvature = trajectory.length > 2 ? totalCurvature / (trajectory.length - 2) : 0;
    // Natural curvature (not perfectly straight, not too erratic)
    if (avgCurvature > 0.05 && avgCurvature < 1.5) {
      score += 10;
    }
    
    // Timing variance (humans have variable timing between samples)
    const timeDiffs = [];
    for (let i = 1; i < trajectory.length; i++) {
      timeDiffs.push(trajectory[i].t - trajectory[i - 1].t);
    }
    if (timeDiffs.length > 0) {
      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgTimeDiff, 2), 0) / timeDiffs.length;
      
      // Bot detection: Zero variance (perfectly constant timing)
      if (variance < 1) {
        suspicionFlags += 2;
        score -= 20;
      }
      // Natural variance in timing (not perfectly constant)
      else if (variance > 10 && variance < 10000) {
        score += 10;
      }
    }
  } else {
    // No mouse data is highly suspicious for checkbox interaction
    suspicionFlags += 3;
    score -= 30;
  }

  // 2. Click latency analysis (15 points max)
  if (behaviorVector.clickLatency !== undefined) {
    // Humans typically take 500ms - 5s to interact
    // Too fast (<200ms) or instant (0ms) is suspicious
    if (behaviorVector.clickLatency > 500 && behaviorVector.clickLatency < 10000) {
      score += 15;
    } else if (behaviorVector.clickLatency < 100) {
      score -= 15; // Extremely suspicious
    }
  }

  // 3. Hover duration analysis (10 points max)
  if (behaviorVector.hoverDuration !== undefined) {
    // Humans hover for a bit before clicking (100ms - 3s is normal)
    if (behaviorVector.hoverDuration > 100 && behaviorVector.hoverDuration < 5000) {
      score += 10;
    } else if (behaviorVector.hoverDuration === 0) {
      score -= 10; // No hover is suspicious
    }
  }

  // 4. Mouse velocity analysis (10 points max)
  if (behaviorVector.mouseVelocity !== undefined) {
    // Human mouse velocity: 50-1500 pixels/second (varies by user)
    // Bots tend to have constant velocity or extreme values
    if (behaviorVector.mouseVelocity > 50 && behaviorVector.mouseVelocity < 2000) {
      score += 10;
    } else if (behaviorVector.mouseVelocity === 0) {
      score -= 15; // No movement is very suspicious
    }
  }

  // 5. Scroll behavior (5 points max)
  if (behaviorVector.scrollBehavior) {
    // Natural scrolling behavior indicates human interaction
    if (Math.abs(behaviorVector.scrollBehavior.scrollVelocity) > 0 && 
        Math.abs(behaviorVector.scrollBehavior.scrollVelocity) < 10000) {
      score += 5;
    }
  }

  // Final AI-powered risk assessment
  // High suspicion flags should dramatically reduce score
  if (suspicionFlags >= 3) {
    score = Math.min(score, 35); // Cap at 35 if highly suspicious
  } else if (suspicionFlags >= 2) {
    score = Math.min(score, 55); // Cap at 55 if moderately suspicious
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateDeviceTrustScore(userAgent?: string, ipAddress?: string): number {
  // Simplified device trust
  // In production, this would check browser fingerprints, IP reputation, etc.
  
  let score = 70; // Base trust
  
  if (userAgent) {
    // Check for common bot user agents
    const botKeywords = ['bot', 'crawler', 'spider', 'scraper', 'headless'];
    const isBot = botKeywords.some(keyword => 
      userAgent.toLowerCase().includes(keyword)
    );
    
    if (isBot) score -= 50;
    
    // Real browsers get bonus
    if (userAgent.includes('Chrome') || userAgent.includes('Firefox') || userAgent.includes('Safari')) {
      score += 10;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

export function fuseBehavioralScores(
  behaviorScore: number,
  semanticScore: number,
  deviceTrustScore: number,
  alpha: number = 0.5,
  beta: number = 0.4,
  gamma: number = 0.1
): number {
  const finalScore = (
    alpha * behaviorScore + 
    beta * semanticScore + 
    gamma * deviceTrustScore
  );
  
  return Math.round(finalScore);
}

export function shouldFlagSuspicious(
  behaviorScore: number,
  semanticScore: number,
  deviceTrustScore: number
): boolean {
  // Flag if any score is extremely low
  if (behaviorScore < 30 || semanticScore < 40 || deviceTrustScore < 40) {
    return true;
  }
  
  // Flag if behavior is too perfect (bot-like)
  if (behaviorScore > 95 && semanticScore > 95) {
    return true;
  }
  
  return false;
}
