import { storage } from '../storage';
import { nanoid } from 'nanoid';

const RATE_LIMITS = {
  start: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  solve: { maxRequests: 3, windowMs: 60000 },  // 3 requests per minute
};

export async function checkRateLimit(
  ipAddress: string,
  action: 'start' | 'solve'
): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_LIMITS[action];
  
  // Get or create rate limit record
  let rateLimit = await storage.getRateLimit(ipAddress, action);
  
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);
  
  if (!rateLimit || new Date(rateLimit.expiresAt) < now) {
    // Create new window
    rateLimit = await storage.createOrUpdateRateLimit({
      id: nanoid(),
      ipAddress,
      action,
      count: 1,
      expiresAt: new Date(now.getTime() + config.windowMs),
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
    };
  }
  
  // Check if within window and under limit
  if (rateLimit.count < config.maxRequests) {
    // Increment count
    await storage.createOrUpdateRateLimit({
      id: rateLimit.id,
      ipAddress,
      action,
      count: rateLimit.count + 1,
      expiresAt: rateLimit.expiresAt,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - (rateLimit.count + 1),
    };
  }
  
  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
  };
}

export async function cleanupExpiredRateLimits(): Promise<void> {
  await storage.deleteExpiredRateLimits();
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
