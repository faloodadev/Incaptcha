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

export interface MouseSample {
  t: number;
  x: number;
  y: number;
}

export interface BehaviorVector {
  mouseTrajectory: MouseSample[];
  clickLatency: number;
  hoverDuration: number;
  mouseVelocity: number;
  timestamp: number;
  scrollBehavior: { scrollY: number; scrollVelocity: number };
}

export interface TurnstileVerifyRequest {
  siteKey: string;
  behaviorVector: BehaviorVector;
}

export interface TurnstileVerifyResponse {
  success: boolean;
  verifyToken?: string;
  score?: number;
  requiresChallenge?: boolean;
  challengeType?: string;
  challengeId?: string;
  challengeToken?: string;
  riskScore?: number;
  error?: string;
}

export interface ChallengeStartRequest {
  siteKey: string;
  challengeType?: string;
}

export interface ChallengeStartResponse {
  success: boolean;
  challengeId?: string;
  challengeData?: any;
  expiresAt?: string;
  error?: string;
}

export interface ChallengeSolveRequest {
  challengeId: string;
  solution: any;
  siteKey: string;
}

export interface ChallengeSolveResponse {
  success: boolean;
  verifyToken?: string;
  score?: number;
  error?: string;
}
