import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Challenges table - stores active CAPTCHA challenges
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey(),
  siteKey: varchar("site_key").notNull(),
  mode: varchar("mode", { length: 20 }).notNull(), // "puzzle" or "images"
  prompt: text("prompt").notNull(),
  images: jsonb("images").notNull().$type<string[]>(),
  correctIndices: jsonb("correct_indices").$type<number[]>(),
  isHoneytrap: boolean("is_honeytrap").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => ({
  siteKeyIdx: index("challenges_site_key_idx").on(table.siteKey),
  expiresAtIdx: index("challenges_expires_at_idx").on(table.expiresAt),
}));

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  createdAt: true,
});

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

// Verification attempts - stores solve attempts with behavioral data
export const verificationAttempts = pgTable("verification_attempts", {
  id: varchar("id").primaryKey(),
  challengeId: varchar("challenge_id").notNull(),
  ipAddress: varchar("ip_address"),
  selectedIndices: jsonb("selected_indices").$type<number[]>(),
  behaviorVector: jsonb("behavior_vector").$type<number[]>(),
  behaviorScore: integer("behavior_score"), // 0-100
  semanticScore: integer("semantic_score"), // 0-100
  deviceTrustScore: integer("device_trust_score"), // 0-100
  finalScore: integer("final_score"), // 0-100
  success: boolean("success").notNull(),
  flaggedSuspicious: boolean("flagged_suspicious").default(false).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  challengeIdIdx: index("attempts_challenge_id_idx").on(table.challengeId),
  ipAddressIdx: index("attempts_ip_address_idx").on(table.ipAddress),
  createdAtIdx: index("attempts_created_at_idx").on(table.createdAt),
}));

export const insertVerificationAttemptSchema = createInsertSchema(verificationAttempts).omit({
  createdAt: true,
});

export type InsertVerificationAttempt = z.infer<typeof insertVerificationAttemptSchema>;
export type VerificationAttempt = typeof verificationAttempts.$inferSelect;

// Verify tokens - stores single-use verification tokens
export const verifyTokens = pgTable("verify_tokens", {
  token: varchar("token").primaryKey(),
  challengeId: varchar("challenge_id").notNull(),
  siteKey: varchar("site_key").notNull(),
  score: integer("score").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => ({
  expiresAtIdx: index("verify_tokens_expires_at_idx").on(table.expiresAt),
}));

export const insertVerifyTokenSchema = createInsertSchema(verifyTokens).omit({
  createdAt: true,
});

export type InsertVerifyToken = z.infer<typeof insertVerifyTokenSchema>;
export type VerifyToken = typeof verifyTokens.$inferSelect;

// Assets - stores categorized images for challenges
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey(),
  url: text("url").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  subcategory: varchar("subcategory", { length: 50 }),
  tags: jsonb("tags").$type<string[]>(),
  localeTags: jsonb("locale_tags").$type<string[]>(),
  safeForKids: boolean("safe_for_kids").default(true).notNull(),
  width: integer("width"),
  height: integer("height"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("assets_category_idx").on(table.category),
}));

export const insertAssetSchema = createInsertSchema(assets).omit({
  createdAt: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Rate limit tracking - stores IP-based rate limits
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey(),
  ipAddress: varchar("ip_address").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // "start" or "solve"
  count: integer("count").default(0).notNull(),
  windowStart: timestamp("window_start").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => ({
  ipActionIdx: index("rate_limits_ip_action_idx").on(table.ipAddress, table.action),
  expiresAtIdx: index("rate_limits_expires_at_idx").on(table.expiresAt),
}));

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  windowStart: true,
});

export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;

// Site keys - stores registered sites with Ed25519 key pairs
export const siteKeys = pgTable("site_keys", {
  key: varchar("key").primaryKey(),
  secretKey: varchar("secret_key"),
  publicKey: varchar("public_key"),
  name: text("name").notNull(),
  domain: text("domain"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSiteKeySchema = createInsertSchema(siteKeys).omit({
  createdAt: true,
});

export type InsertSiteKey = z.infer<typeof insertSiteKeySchema>;
export type SiteKey = typeof siteKeys.$inferSelect;
