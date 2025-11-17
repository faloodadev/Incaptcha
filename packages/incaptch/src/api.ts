import type { SessionResponse, VerifyTokenResponse, TokenIntrospectRequest, TokenIntrospectResponse, TurnstileVerifyRequest, TurnstileVerifyResponse, ChallengeStartRequest, ChallengeStartResponse, ChallengeSolveRequest, ChallengeSolveResponse } from './types';

const DEFAULT_API_BASE = 'https://api.incaptcha.com';

export class InCaptchaAPI {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl;
  }

  async initSession(siteKey: string): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/api/captcha/checkbox/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ siteKey }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize session: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyCheckbox(nonce: string, behaviorVector: number[]): Promise<VerifyTokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/captcha/checkbox/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nonce, behaviorVector }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify checkbox: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyTurnstile(request: TurnstileVerifyRequest): Promise<TurnstileVerifyResponse> {
    const response = await fetch(`${this.baseUrl}/api/incaptcha/turnstile/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify turnstile: ${response.statusText}`);
    }

    return response.json();
  }

  async startChallenge(request: ChallengeStartRequest): Promise<ChallengeStartResponse> {
    const response = await fetch(`${this.baseUrl}/api/incaptcha/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start challenge: ${response.statusText}`);
    }

    return response.json();
  }

  async solveChallenge(request: ChallengeSolveRequest): Promise<ChallengeSolveResponse> {
    const response = await fetch(`${this.baseUrl}/api/incaptcha/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to solve challenge: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyToken(token: string, siteKey: string, secretKey: string): Promise<VerifyTokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/incaptcha/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, siteKey, secretKey }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify token: ${response.statusText}`);
    }

    return response.json();
  }

  async introspectToken(request: TokenIntrospectRequest): Promise<TokenIntrospectResponse> {
    const response = await fetch(`${this.baseUrl}/api/captcha/token/introspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to introspect token: ${response.statusText}`);
    }

    return response.json();
  }
}
