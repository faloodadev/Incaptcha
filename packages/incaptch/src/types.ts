export interface InCaptchaConfig {
  siteKey: string;
  apiBaseUrl?: string;
}

export interface CheckboxOptions {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  apiBaseUrl?: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  verifyToken?: string;
  score?: number;
  error?: string;
}

export interface SessionResponse {
  sessionId: string;
  nonce: string;
  expiresAt: string;
}

export interface TokenIntrospectRequest {
  token: string;
  apiKey: string;
  secretKey: string;
}

export interface TokenIntrospectResponse {
  valid: boolean;
  token?: {
    challengeId: string;
    siteKey: string;
    score: number;
    used: boolean;
    expired: boolean;
    createdAt: string;
    expiresAt: string;
  };
  error?: string;
}
