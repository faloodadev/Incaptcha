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
  const intersection = new Set([...selectedSet].filter(x => correctSet.has(x)));
  const union = new Set([...selectedSet, ...correctSet]);
  
  const similarity = intersection.size / union.size;
  
  // Convert to 0-100 score
  const score = Math.round(similarity * 100);
  
  return score;
}

export function calculateBehaviorScore(behaviorVector: number[]): number {
  if (!behaviorVector || behaviorVector.length === 0) {
    return 50; // Neutral score if no data
  }

  // Analyze behavioral features
  const mouseActivity = behaviorVector[0] || 0; // Mouse movements
  const distance = behaviorVector[1] || 0; // Total distance
  const velocity = behaviorVector[2] || 0; // Average velocity
  const timeToFirst = behaviorVector[4] || 0; // Time to first interaction
  
  // Calculate human-likeness
  // Humans have: moderate mouse activity, varied velocity, natural hesitation
  let score = 50;
  
  // Mouse activity (0.2-0.8 is human-like)
  if (mouseActivity > 0.1 && mouseActivity < 0.9) score += 15;
  
  // Distance traveled (humans move cursor naturally)
  if (distance > 0.2 && distance < 0.95) score += 15;
  
  // Velocity variance (not too fast, not too slow)
  if (velocity > 0.1 && velocity < 0.7) score += 10;
  
  // Time to first interaction (humans have slight hesitation)
  if (timeToFirst > 0.1 && timeToFirst < 0.6) score += 10;
  
  return Math.min(100, Math.max(0, score));
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
