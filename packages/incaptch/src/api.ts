import type { SessionResponse, VerifyTokenResponse, TokenIntrospectRequest, TokenIntrospectResponse } from './types';

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
