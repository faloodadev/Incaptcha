import {
  challenges,
  verificationAttempts,
  verifyTokens,
  assets,
  rateLimits,
  siteKeys,
  type Challenge,
  type InsertChallenge,
  type VerificationAttempt,
  type InsertVerificationAttempt,
  type VerifyToken,
  type InsertVerifyToken,
  type Asset,
  type InsertAsset,
  type RateLimit,
  type InsertRateLimit,
  type SiteKey,
  type InsertSiteKey,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Challenges
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  deleteExpiredChallenges(): Promise<void>;

  // Verification Attempts
  createVerificationAttempt(attempt: InsertVerificationAttempt): Promise<VerificationAttempt>;
  getAttemptsByChallenge(challengeId: string): Promise<VerificationAttempt[]>;
  getRecentAttempts(limit: number): Promise<VerificationAttempt[]>;

  // Verify Tokens
  createVerifyToken(token: InsertVerifyToken): Promise<VerifyToken>;
  getVerifyToken(token: string): Promise<VerifyToken | undefined>;
  markTokenAsUsed(token: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;

  // Assets
  createAsset(asset: InsertAsset): Promise<Asset>;
  getAssetsByCategory(category: string, limit?: number): Promise<Asset[]>;
  getAllAssets(): Promise<Asset[]>;

  // Rate Limits
  getRateLimit(ipAddress: string, action: string): Promise<RateLimit | undefined>;
  createOrUpdateRateLimit(rateLimit: InsertRateLimit): Promise<RateLimit>;
  deleteExpiredRateLimits(): Promise<void>;

  // Site Keys
  createSiteKey(siteKey: InsertSiteKey): Promise<SiteKey>;
  getSiteKey(key: string): Promise<SiteKey | undefined>;
  getAllSiteKeys(): Promise<SiteKey[]>;
  updateSiteKeyKeys(key: string, secretKey: string, publicKey: string): Promise<void>;
  deleteSiteKey(key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Challenges
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db
      .insert(challenges)
      .values(insertChallenge)
      .returning();
    return challenge;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id));
    return challenge || undefined;
  }

  async deleteExpiredChallenges(): Promise<void> {
    await db
      .delete(challenges)
      .where(lte(challenges.expiresAt, new Date()));
  }

  // Verification Attempts
  async createVerificationAttempt(insertAttempt: InsertVerificationAttempt): Promise<VerificationAttempt> {
    const [attempt] = await db
      .insert(verificationAttempts)
      .values(insertAttempt)
      .returning();
    return attempt;
  }

  async getAttemptsByChallenge(challengeId: string): Promise<VerificationAttempt[]> {
    return db
      .select()
      .from(verificationAttempts)
      .where(eq(verificationAttempts.challengeId, challengeId));
  }

  async getRecentAttempts(limit: number): Promise<VerificationAttempt[]> {
    return db
      .select()
      .from(verificationAttempts)
      .orderBy(desc(verificationAttempts.createdAt))
      .limit(limit);
  }

  // Verify Tokens
  async createVerifyToken(insertToken: InsertVerifyToken): Promise<VerifyToken> {
    const [token] = await db
      .insert(verifyTokens)
      .values(insertToken)
      .returning();
    return token;
  }

  async getVerifyToken(token: string): Promise<VerifyToken | undefined> {
    const [verifyToken] = await db
      .select()
      .from(verifyTokens)
      .where(eq(verifyTokens.token, token));
    return verifyToken || undefined;
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await db
      .update(verifyTokens)
      .set({ used: true })
      .where(eq(verifyTokens.token, token));
  }

  async deleteExpiredTokens(): Promise<void> {
    await db
      .delete(verifyTokens)
      .where(lte(verifyTokens.expiresAt, new Date()));
  }

  // Assets
  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const [asset] = await db
      .insert(assets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async getAssetsByCategory(category: string, limit: number = 50): Promise<Asset[]> {
    return db
      .select()
      .from(assets)
      .where(eq(assets.category, category))
      .limit(limit);
  }

  async getAllAssets(): Promise<Asset[]> {
    return db.select().from(assets);
  }

  // Rate Limits
  async getRateLimit(ipAddress: string, action: string): Promise<RateLimit | undefined> {
    const [rateLimit] = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.ipAddress, ipAddress),
          eq(rateLimits.action, action),
          gte(rateLimits.expiresAt, new Date())
        )
      );
    return rateLimit || undefined;
  }

  async createOrUpdateRateLimit(insertRateLimit: InsertRateLimit): Promise<RateLimit> {
    const existing = await this.getRateLimit(insertRateLimit.ipAddress, insertRateLimit.action);
    
    if (existing) {
      const [updated] = await db
        .update(rateLimits)
        .set({ count: insertRateLimit.count })
        .where(eq(rateLimits.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(rateLimits)
        .values(insertRateLimit)
        .returning();
      return created;
    }
  }

  async deleteExpiredRateLimits(): Promise<void> {
    await db
      .delete(rateLimits)
      .where(lte(rateLimits.expiresAt, new Date()));
  }

  // Site Keys
  async createSiteKey(insertSiteKey: InsertSiteKey): Promise<SiteKey> {
    const [siteKey] = await db
      .insert(siteKeys)
      .values(insertSiteKey)
      .returning();
    return siteKey;
  }

  async getSiteKey(key: string): Promise<SiteKey | undefined> {
    const [siteKey] = await db
      .select()
      .from(siteKeys)
      .where(eq(siteKeys.key, key));
    return siteKey || undefined;
  }

  async getAllSiteKeys(): Promise<SiteKey[]> {
    return db.select().from(siteKeys);
  }

  async updateSiteKeyKeys(key: string, secretKey: string, publicKey: string): Promise<void> {
    await db
      .update(siteKeys)
      .set({ secretKey, publicKey })
      .where(eq(siteKeys.key, key));
  }

  async deleteSiteKey(key: string): Promise<void> {
    await db
      .delete(siteKeys)
      .where(eq(siteKeys.key, key));
  }
}

export const storage = new DatabaseStorage();
