# InCaptcha Library - Complete API Reference

The `incaptch` package provides a complete integration with InCaptcha backend services, including Turnstile checkbox verification and full API support.

## Installation

```bash
npm install incaptch
```

## Components

### CheckboxWidget

React component for Turnstile-style checkbox verification with behavioral tracking.

```tsx
import { CheckboxWidget } from 'incaptch';

<CheckboxWidget
  siteKey="your-site-key"
  onVerify={(token) => console.log('Verified!', token)}
  onError={(error) => console.error(error)}
  theme="light"
  apiBaseUrl="https://your-api.com"
/>
```

## API Client

### InCaptchaAPI Class

Complete TypeScript client for all InCaptcha backend endpoints.

```typescript
import { InCaptchaAPI } from 'incaptch';

const api = new InCaptchaAPI('https://your-api.com');
```

### Available Methods

#### 1. Turnstile Verification (Primary Method)

```typescript
// Verify Turnstile checkbox with behavioral data
const result = await api.verifyTurnstile({
  siteKey: 'your-site-key',
  behaviorVector: {
    mouseTrajectory: [...],
    clickLatency: 1500,
    hoverDuration: 800,
    mouseVelocity: 250,
    timestamp: Date.now(),
    scrollBehavior: { scrollY: 100, scrollVelocity: 50 }
  }
});

// Response includes:
// - success: boolean
// - verifyToken?: string
// - score?: number
// - requiresChallenge?: boolean
// - challengeType?: string
// - challengeId?: string
```

#### 2. Challenge Management

```typescript
// Start a new challenge
const challenge = await api.startChallenge({
  siteKey: 'your-site-key',
  challengeType: 'jigsaw'
});

// Solve a challenge
const solution = await api.solveChallenge({
  challengeId: challenge.challengeId,
  solution: { /* challenge-specific data */ },
  siteKey: 'your-site-key'
});
```

#### 3. Token Verification (Server-Side)

```typescript
// Verify a token on your backend
const verified = await api.verifyToken(
  'verify-token-from-client',
  'your-site-key',
  'your-secret-key'
);
```

#### 4. Token Introspection

```typescript
// Get detailed token information
const tokenInfo = await api.introspectToken({
  token: 'verify-token',
  apiKey: 'your-api-key',
  secretKey: 'your-secret-key'
});

// Returns token details:
// - valid: boolean
// - token: { challengeId, siteKey, score, used, expired, ... }
```

#### 5. Session Management

```typescript
// Initialize checkbox session
const session = await api.initSession('your-site-key');
// Returns: { sessionId, nonce, expiresAt }

// Verify checkbox with session
const result = await api.verifyCheckbox(session.nonce, behaviorVector);
```

## TypeScript Types

All request/response types are fully typed:

```typescript
import type {
  InCaptchaConfig,
  CheckboxOptions,
  TurnstileVerifyRequest,
  TurnstileVerifyResponse,
  ChallengeStartRequest,
  ChallengeStartResponse,
  ChallengeSolveRequest,
  ChallengeSolveResponse,
  VerifyTokenResponse,
  SessionResponse,
  TokenIntrospectRequest,
  TokenIntrospectResponse,
  BehaviorVector,
  MouseSample
} from 'incaptch';
```

## Backend Integration

The library connects to these InCaptcha API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/incaptcha/turnstile/verify` | POST | Verify Turnstile checkbox |
| `/api/incaptcha/start` | POST | Start new challenge |
| `/api/incaptcha/solve` | POST | Solve challenge |
| `/api/incaptcha/verify` | POST | Verify token (server-side) |
| `/api/captcha/checkbox/init` | POST | Initialize session |
| `/api/captcha/checkbox/verify` | POST | Verify checkbox |
| `/api/captcha/token/introspect` | POST | Get token details |

## Example: Complete Flow

```typescript
import { CheckboxWidget, InCaptchaAPI } from 'incaptch';

// Frontend: Use CheckboxWidget component
function LoginForm() {
  const handleVerify = async (verifyToken: string) => {
    // Send token to your backend
    await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ verifyToken }),
    });
  };

  return (
    <form>
      <input type="email" />
      <input type="password" />
      <CheckboxWidget
        siteKey="demo_site_key"
        onVerify={handleVerify}
        apiBaseUrl=""
      />
      <button>Login</button>
    </form>
  );
}

// Backend: Verify the token
const api = new InCaptchaAPI('http://localhost:5000');

app.post('/api/login', async (req, res) => {
  const { verifyToken } = req.body;
  
  const result = await api.verifyToken(
    verifyToken,
    'demo_site_key',
    'your-secret-key'
  );
  
  if (result.success && result.score > 80) {
    // User is verified human
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
});
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│           incaptch Package                      │
│  ┌──────────────────────────────────────────┐  │
│  │  CheckboxWidget (React Component)        │  │
│  │  - Behavioral tracking                   │  │
│  │  - Turnstile verification                │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  InCaptchaAPI (TypeScript Client)        │  │
│  │  - verifyTurnstile()                     │  │
│  │  - startChallenge()                      │  │
│  │  - solveChallenge()                      │  │
│  │  - verifyToken()                         │  │
│  │  - introspectToken()                     │  │
│  │  - initSession()                         │  │
│  │  - verifyCheckbox()                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│        InCaptcha Backend API                    │
│  - AI-powered bot detection                     │
│  - Risk-based challenge escalation              │
│  - Ed25519 JWT token generation                 │
│  - Device trust scoring                         │
└─────────────────────────────────────────────────┘
```

## License

MIT
