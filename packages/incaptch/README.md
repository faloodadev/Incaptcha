# InCaptcha - Checkbox Verification Library

The official JavaScript/TypeScript library for InCaptcha checkbox verification.

## Installation

```bash
npm install incaptch
```

## Quick Start

### React Integration

```tsx
import { CheckboxWidget } from 'incaptch';

function LoginForm() {
  const handleVerify = (token: string) => {
    console.log('Verification token:', token);
    // Send token to your backend for validation
  };

  const handleError = (error: string) => {
    console.error('Captcha error:', error);
  };

  return (
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      
      <CheckboxWidget
        siteKey="your_site_key_here"
        onVerify={handleVerify}
        onError={handleError}
        theme="light"
      />
      
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Vanilla JavaScript

```html
<div id="incaptcha-widget"></div>

<script type="module">
  import { CheckboxWidget } from 'incaptch';
  import { createRoot } from 'react-dom/client';

  const root = createRoot(document.getElementById('incaptcha-widget'));
  root.render(
    <CheckboxWidget
      siteKey="your_site_key_here"
      onVerify={(token) => console.log('Token:', token)}
    />
  );
</script>
```

## API Client

For server-side token verification:

```typescript
import { InCaptchaAPI } from 'incaptch';

const api = new InCaptchaAPI('https://api.incaptcha.com');

// Introspect a token
const result = await api.introspectToken({
  token: verifyToken,
  apiKey: 'your_api_key',
  secretKey: 'your_secret_key',
});

if (result.valid) {
  console.log('Token is valid, score:', result.token?.score);
} else {
  console.log('Token is invalid:', result.error);
}
```

## Configuration

### CheckboxWidget Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `siteKey` | string | Yes | Your InCaptcha site key |
| `onVerify` | (token: string) => void | Yes | Callback when verification succeeds |
| `onError` | (error: string) => void | No | Callback when an error occurs |
| `theme` | 'light' \| 'dark' | No | Widget theme (default: 'light') |
| `apiBaseUrl` | string | No | Custom API base URL |

## Security Best Practices

1. **Never expose your secret key** in client-side code
2. **Always verify tokens server-side** using the token introspection API
3. **Use HTTPS** for all API requests
4. **Implement rate limiting** on your backend
5. **Store API keys securely** in environment variables

## Support

- Documentation: https://docs.incaptcha.com
- API Reference: https://api.incaptcha.com/docs
- Issues: https://github.com/incaptcha/incaptch/issues

## License

MIT
