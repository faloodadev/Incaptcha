import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const SECRET = process.env.INCAPTCHA_SECRET || 'fallback_secret_for_development_only';

interface ChallengeTokenPayload {
  challengeId: string;
  siteKey: string;
  iat: number;
  exp: number;
}

interface VerifyTokenPayload {
  challengeId: string;
  siteKey: string;
  score: number;
  nonce: string;
  iat: number;
  exp: number;
}

export function generateChallengeToken(challengeId: string, siteKey: string): string {
  const payload: ChallengeTokenPayload = {
    challengeId,
    siteKey,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60, // 60 seconds
  };

  return jwt.sign(payload, SECRET, { algorithm: 'HS512' });
}

export function verifyChallengeToken(token: string): ChallengeTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS512'] }) as ChallengeTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateVerifyToken(
  challengeId: string,
  siteKey: string,
  score: number
): string {
  const nonce = randomBytes(16).toString('hex');
  
  const payload: VerifyTokenPayload = {
    challengeId,
    siteKey,
    score,
    nonce,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 180, // 180 seconds
  };

  return jwt.sign(payload, SECRET, { algorithm: 'HS512' });
}

export function verifyVerifyToken(token: string): VerifyTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS512'] }) as VerifyTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
