import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import {
  generateChallengeToken,
  verifyChallengeToken,
  generateVerifyToken,
  verifyVerifyToken,
} from "./lib/tokens";
import {
  calculateSemanticScore,
  calculateBehaviorScore,
  calculateDeviceTrustScore,
  fuseBehavioralScores,
  shouldFlagSuspicious,
} from "./lib/verification";
import { checkRateLimit } from "./lib/rateLimit";
import {
  seedAssets,
  getRandomAssets,
  getAssetsForCategory,
  getRandomCategory,
  getCategoryPrompt,
} from "./lib/assets";

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed assets on startup
  seedAssets().catch(console.error);

  // Ensure default site key exists with Ed25519 keys
  const defaultSiteKey = await storage.getSiteKey('demo_site_key');
  if (!defaultSiteKey) {
    const { generateEd25519KeyPair } = await import('./crypto');
    const { publicKey, secretKey } = await generateEd25519KeyPair();
    await storage.createSiteKey({
      key: 'demo_site_key',
      secretKey,
      publicKey,
      name: 'Demo Site',
      active: true,
    });
    console.log('Created demo site key with Ed25519 key pair');
  } else if (!defaultSiteKey.secretKey || !defaultSiteKey.publicKey) {
    // Upgrade existing site key with Ed25519 keys
    const { generateEd25519KeyPair } = await import('./crypto');
    const { publicKey, secretKey } = await generateEd25519KeyPair();
    await storage.updateSiteKeyKeys('demo_site_key', secretKey, publicKey);
    console.log('Updated demo site key with Ed25519 key pair');
  }

  // POST /api/incaptcha/start - Start a new challenge
  app.post('/api/incaptcha/start', async (req, res) => {
    try {
      const { siteKey, theme, lang } = req.body;
      const ipAddress = getClientIp(req);

      // Check rate limit
      const rateLimit = await checkRateLimit(ipAddress, 'start');
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
        });
      }

      // Validate site key
      const site = await storage.getSiteKey(siteKey || 'demo_site_key');
      if (!site || !site.active) {
        return res.status(400).json({
          error: 'Invalid site key',
        });
      }

      // Determine challenge mode (for demo, always use images mode)
      const mode: 'images' | 'puzzle' = 'images';

      // Select random category
      const category = getRandomCategory();
      const prompt = getCategoryPrompt(category);

      // Get 9 images (6 from category, 3 random)
      const categoryImages = await getAssetsForCategory(category, 6);
      const randomImages = await getRandomAssets(3);
      const allImages = [...categoryImages, ...randomImages].sort(() => Math.random() - 0.5);

      // Correct indices are the category images
      const correctIndices: number[] = [];
      allImages.forEach((img, index) => {
        if (categoryImages.includes(img)) {
          correctIndices.push(index);
        }
      });

      // Randomly make 0.5% of challenges honeytraps
      const isHoneytrap = Math.random() < 0.005;

      // Create challenge
      const challengeId = nanoid();
      const expiresAt = new Date(Date.now() + 60000); // 60 seconds

      const challenge = await storage.createChallenge({
        id: challengeId,
        siteKey: site.key,
        mode,
        prompt,
        images: allImages,
        correctIndices,
        isHoneytrap,
        expiresAt,
      });

      // Generate challenge token
      const challengeToken = generateChallengeToken(challengeId, site.key);

      res.json({
        challengeId: challenge.id,
        prompt: challenge.prompt,
        images: challenge.images,
        challengeToken,
        mode: challenge.mode,
      });
    } catch (error) {
      console.error('Error in /api/incaptcha/start:', error);
      res.status(500).json({
        error: 'Failed to create challenge',
      });
    }
  });

  // POST /api/incaptcha/solve - Solve a challenge
  app.post('/api/incaptcha/solve', async (req, res) => {
    try {
      const { challengeId, challengeToken, selectedIndices, behaviorVector } = req.body;
      const ipAddress = getClientIp(req);
      const userAgent = req.headers['user-agent'];

      // Check rate limit
      const rateLimit = await checkRateLimit(ipAddress, 'solve');
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please wait before trying again.',
        });
      }

      // Verify challenge token
      const tokenPayload = verifyChallengeToken(challengeToken);
      if (!tokenPayload || tokenPayload.challengeId !== challengeId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired challenge token',
        });
      }

      // Get challenge
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found',
        });
      }

      // Check if expired
      if (new Date(challenge.expiresAt) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Challenge has expired',
        });
      }

      // Calculate scores
      const semanticScore = calculateSemanticScore(
        selectedIndices,
        challenge.correctIndices as number[],
        challenge.isHoneytrap || false
      );

      const behaviorScore = calculateBehaviorScore(behaviorVector);
      const deviceTrustScore = calculateDeviceTrustScore(userAgent, ipAddress);

      // Fuse scores
      const finalScore = fuseBehavioralScores(
        behaviorScore,
        semanticScore,
        deviceTrustScore
      );

      // Determine success (threshold: 75)
      const success = finalScore >= 75;

      // Check if suspicious
      const flaggedSuspicious = shouldFlagSuspicious(
        behaviorScore,
        semanticScore,
        deviceTrustScore
      );

      // Create verification attempt
      const attempt = await storage.createVerificationAttempt({
        id: nanoid(),
        challengeId,
        ipAddress,
        selectedIndices,
        behaviorVector,
        behaviorScore,
        semanticScore,
        deviceTrustScore,
        finalScore,
        success,
        flaggedSuspicious,
        userAgent,
      });

      if (success) {
        // Generate verify token
        const verifyToken = generateVerifyToken(
          challengeId,
          challenge.siteKey,
          finalScore
        );

        // Store verify token
        await storage.createVerifyToken({
          token: verifyToken,
          challengeId,
          siteKey: challenge.siteKey,
          score: finalScore,
          used: false,
          expiresAt: new Date(Date.now() + 180000), // 180 seconds
        });

        res.json({
          success: true,
          verifyToken,
          score: finalScore,
        });
      } else {
        res.json({
          success: false,
          message: 'Verification failed. Please try again.',
          score: finalScore,
        });
      }
    } catch (error) {
      console.error('Error in /api/incaptcha/solve:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process verification',
      });
    }
  });

  // POST /api/incaptcha/turnstile/verify - Simplified Turnstile-style verification with Ed25519 JWT
  app.post('/api/incaptcha/turnstile/verify', async (req, res) => {
    try {
      const { siteKey, behaviorVector } = req.body;
      const ipAddress = getClientIp(req);

      // Check rate limit
      const rateLimit = await checkRateLimit(ipAddress, 'solve');
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Too many verification attempts. Please try again later.',
        });
      }

      // Validate site key and get secret key
      const site = await storage.getSiteKey(siteKey || 'demo_site_key');
      if (!site || !site.active) {
        return res.status(400).json({
          success: false,
          error: 'Invalid site key',
        });
      }

      // Ensure site has secret key configured
      if (!site.secretKey || !site.publicKey) {
        return res.status(500).json({
          success: false,
          error: 'Site key not properly configured. Please regenerate keys.',
        });
      }

      // Calculate behavior score (simpler verification)
      const behaviorScore = calculateBehaviorScore(behaviorVector);
      const deviceTrustScore = calculateDeviceTrustScore(req.headers['user-agent'] || '', ipAddress);
      
      // Simple fusion for Turnstile-style verification
      const finalScore = Math.round((behaviorScore * 0.5) + (deviceTrustScore * 0.5));
      
      // Risk-based challenge escalation
      // If score is between 40-60, require jigsaw puzzle challenge
      // If score is below 40, likely bot - fail immediately
      const RISK_THRESHOLD_HIGH = 40; // Below this = fail
      const RISK_THRESHOLD_MEDIUM = 60; // Below this = require puzzle
      
      if (finalScore < RISK_THRESHOLD_HIGH) {
        return res.json({
          success: false,
          message: 'Verification failed. Please try again.',
          riskLevel: 'high',
        });
      }
      
      if (finalScore < RISK_THRESHOLD_MEDIUM) {
        // Escalate to jigsaw puzzle challenge
        const challengeId = nanoid();
        const expiresAt = new Date(Date.now() + 120000); // 2 minutes
        
        // Create jigsaw puzzle challenge
        const challenge = await storage.createChallenge({
          id: challengeId,
          siteKey: site.key,
          mode: 'jigsaw',
          prompt: 'Complete the puzzle to verify',
          images: [], // Puzzle image will be generated client-side
          correctIndices: [],
          isHoneytrap: false,
          expiresAt,
        });
        
        const challengeToken = generateChallengeToken(challengeId, site.key);
        
        return res.json({
          success: false,
          requiresChallenge: true,
          challengeType: 'jigsaw',
          challengeId: challenge.id,
          challengeToken,
          riskScore: finalScore,
          message: 'Additional verification required',
        });
      }

      // Score is good enough for checkbox verification
      const challengeId = 'turnstile_' + nanoid();
      
      // Generate secure Ed25519 JWT token
      const { generateSecureVerifyToken } = await import('./crypto');
      const verifyToken = await generateSecureVerifyToken(
        challengeId,
        site.key,
        finalScore,
        site.secretKey
      );

      // Store verify token (one token per verification)
      await storage.createVerifyToken({
        token: verifyToken,
        challengeId: challengeId,
        siteKey: site.key,
        score: finalScore,
        used: false,
        expiresAt: new Date(Date.now() + 120000), // 2 minutes (120 seconds)
      });

      return res.json({
        success: true,
        verifyToken,
        score: finalScore,
      });
    } catch (error) {
      console.error('Error in /api/incaptcha/turnstile/verify:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process verification',
      });
    }
  });

  // POST /api/incaptcha/verify - Verify a token with Ed25519 JWT (server-side only, public key verification)
  app.post('/api/incaptcha/verify', async (req, res) => {
    try {
      const { verifyToken } = req.body;

      if (!verifyToken) {
        return res.status(400).json({
          valid: false,
          message: 'Verify token is required',
        });
      }

      // Check if token exists in database first
      const storedToken = await storage.getVerifyToken(verifyToken);
      if (!storedToken) {
        return res.json({
          valid: false,
          message: 'Token not found',
        });
      }

      // Get site and retrieve public key for verification
      const site = await storage.getSiteKey(storedToken.siteKey);
      if (!site || !site.active) {
        return res.json({
          valid: false,
          message: 'Invalid site key',
        });
      }

      // Ensure site has public key configured
      if (!site.publicKey) {
        return res.status(500).json({
          valid: false,
          message: 'Site public key not configured',
        });
      }

      // Verify Ed25519 JWT signature using public key (server-side verification)
      const { verifySecureToken } = await import('./crypto');
      const tokenPayload = await verifySecureToken(verifyToken, site.publicKey);
      
      if (!tokenPayload) {
        return res.json({
          valid: false,
          message: 'Invalid token signature or expired',
        });
      }

      // Check if token has been used (replay protection)
      if (storedToken.used) {
        return res.json({
          valid: false,
          message: 'Token has already been used',
        });
      }

      // Check if token has expired
      if (new Date(storedToken.expiresAt) < new Date()) {
        return res.json({
          valid: false,
          message: 'Token has expired',
        });
      }

      // Mark token as used
      await storage.markTokenAsUsed(verifyToken);

      res.json({
        valid: true,
        siteKey: storedToken.siteKey,
        score: storedToken.score,
        challengeId: tokenPayload.challengeId,
        timestamp: storedToken.createdAt,
        verified: true,
      });
    } catch (error) {
      console.error('Error in /api/incaptcha/verify:', error);
      res.status(500).json({
        valid: false,
        message: 'Failed to verify token',
      });
    }
  });

  // GET /api/admin/stats - Get admin statistics
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const recentAttempts = await storage.getRecentAttempts(20);
      const allAttempts = await storage.getRecentAttempts(1000);
      const allChallenges = await storage.getRecentAttempts(1000); // Proxy for challenges

      const totalAttempts = allAttempts.length;
      const successfulVerifications = allAttempts.filter(a => a.success).length;
      const failedVerifications = allAttempts.filter(a => !a.success).length;
      const suspiciousAttempts = allAttempts.filter(a => a.flaggedSuspicious).length;

      const averageScore = totalAttempts > 0
        ? allAttempts.reduce((sum, a) => sum + (a.finalScore || 0), 0) / totalAttempts
        : 0;

      res.json({
        totalChallenges: allChallenges.length,
        totalAttempts,
        successfulVerifications,
        failedVerifications,
        suspiciousAttempts,
        averageScore,
        recentAttempts: recentAttempts.map(a => ({
          id: a.id,
          success: a.success,
          score: a.finalScore || 0,
          createdAt: a.createdAt,
          flaggedSuspicious: a.flaggedSuspicious,
        })),
      });
    } catch (error) {
      console.error('Error in /api/admin/stats:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
      });
    }
  });

  // Cleanup expired data periodically
  setInterval(async () => {
    try {
      await storage.deleteExpiredChallenges();
      await storage.deleteExpiredTokens();
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  const httpServer = createServer(app);
  return httpServer;
}
