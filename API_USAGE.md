# InCaptcha API Usage Guide

## Overview

InCaptcha provides a secure, modern checkbox CAPTCHA solution with Ed25519 JWT token generation and verification.

## Getting Started

### 1. Site Key and Secret Key

When you register a site with InCaptcha, you receive:
- **Site Key** (Public): Used in your frontend to initialize the CAPTCHA widget
- **Secret Key** (Private): Stored securely on your server, NEVER exposed to clients
- **Public Key** (Generated automatically): Used internally for JWT verification

For the demo, use:
```
Site Key: demo_site_key
```

### 2. Frontend Integration

Add the TurnstileCheckbox component to your page:

```tsx
import { TurnstileCheckbox } from '@/components/incaptcha/TurnstileCheckbox';

function MyForm() {
  const handleSuccess = (verifyToken: string) => {
    // Send verifyToken to your backend for validation
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyToken })
    });
  };

  return (
    <form>
      <TurnstileCheckbox
        siteKey="your_site_key"
        onSuccess={handleSuccess}
        onError={(error) => console.error(error)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 3. Backend Verification

**IMPORTANT**: Verification happens server-side only. Never expose your secret key to clients.

#### Endpoint: `POST /api/incaptcha/verify`

**Request:**
```json
{
  "verifyToken": "eyJhbGci..."
}
```

**Response (Success):**
```json
{
  "valid": true,
  "siteKey": "demo_site_key",
  "score": 75,
  "challengeId": "turnstile_abc123",
  "timestamp": "2025-11-15T09:30:00.000Z",
  "verified": true
}
```

**Response (Failure):**
```json
{
  "valid": false,
  "message": "Token has expired"
}
```

**Example (Node.js/Express):**
```javascript
app.post('/api/submit', async (req, res) => {
  const { verifyToken } = req.body;
  
  try {
    // Verify the token with InCaptcha
    const response = await fetch('http://localhost:5000/api/incaptcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyToken })
    });
    
    const result = await response.json();
    
    if (result.valid) {
      // Token is valid - proceed with form submission
      // Token is automatically marked as used (replay protection)
      res.json({ success: true, message: 'Form submitted' });
    } else {
      // Token is invalid
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});
```

## Security Features

### Ed25519 JWT Tokens
- Tokens are signed using Ed25519 (EdDSA algorithm)
- Cryptographically secure, fast verification
- 256-bit keys (more secure and performant than RSA)

### Token Properties
- **Expiration**: 2 minutes (120 seconds)
- **Single-use**: Tokens are marked as used after verification (replay protection)
- **Signed**: Ed25519 signature prevents tampering
- **Bound**: Token includes challenge ID and site key

### Verification Security
- Secret key never leaves your server
- Verification uses public key cryptography
- Server-side only verification
- Automatic token invalidation after use

## Token Lifecycle

1. **User completes checkbox** → Behavioral analysis + device trust scoring
2. **Score ≥ 60** → Server generates Ed25519 JWT token
3. **Token sent to frontend** → User receives verify token
4. **Frontend sends to your backend** → Your server calls `/api/incaptcha/verify`
5. **InCaptcha verifies** → Checks signature, expiry, and single-use
6. **Token marked as used** → Replay protection activated
7. **Result returned** → Your backend proceeds or rejects

## Error Codes

| Message | Description |
|---------|-------------|
| `Token not found` | Token doesn't exist in database |
| `Invalid token signature or expired` | JWT signature invalid or token expired (>2 min) |
| `Token has already been used` | Replay attack detected |
| `Token has expired` | Token older than 2 minutes |
| `Site public key not configured` | Site key misconfigured |

## Best Practices

1. **Always verify server-side** - Never trust client-side verification
2. **Check the score** - Higher scores indicate more confident human verification
3. **Handle errors gracefully** - Show user-friendly messages on verification failure
4. **Rate limit** - Combine with rate limiting for additional security
5. **HTTPS only** - Always use HTTPS in production
6. **Never expose secret keys** - Keep secret keys secure, never commit to git

## Testing

For development, you can test the verification flow:

1. Visit `http://localhost:5000`
2. Complete the checkbox CAPTCHA
3. Copy the verification token shown after success
4. Test verification:

```bash
curl -X POST http://localhost:5000/api/incaptcha/verify \
  -H "Content-Type: application/json" \
  -d '{"verifyToken":"YOUR_TOKEN_HERE"}'
```

## Support

For issues or questions, please refer to the documentation or contact support.
