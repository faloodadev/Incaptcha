
# InCaptcha - Checkbox Verification Library

The official JavaScript/TypeScript library for InCaptcha checkbox verification. Works with any framework or vanilla JavaScript!

## Installation

```bash
npm install incaptch
```

## Quick Start

### Vanilla JavaScript / HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  <h1>Login</h1>
  <form id="login-form">
    <input type="email" placeholder="Email" required />
    <input type="password" placeholder="Password" required />
    
    <!-- InCaptcha Widget Container -->
    <div id="incaptcha-widget"></div>
    
    <button type="submit">Sign In</button>
  </form>

  <script type="module">
    import { CheckboxWidget } from 'incaptch';

    const widget = new CheckboxWidget('incaptcha-widget', {
      siteKey: 'your_site_key_here',
      onVerify: (token) => {
        console.log('Verification token:', token);
        // Send token to your backend
        document.getElementById('login-form').submit();
      },
      onError: (error) => {
        console.error('Captcha error:', error);
      },
      theme: 'light', // or 'dark'
      apiBaseUrl: '' // optional, defaults to same origin
    });
  </script>
</body>
</html>
```

### React

```tsx
import { CheckboxWidget } from 'incaptch';
import { useEffect, useRef } from 'react';

function LoginForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<CheckboxWidget | null>(null);

  useEffect(() => {
    if (containerRef.current && !widgetRef.current) {
      widgetRef.current = new CheckboxWidget('incaptcha-container', {
        siteKey: 'your_site_key_here',
        onVerify: (token) => {
          console.log('Token:', token);
          // Submit your form
        },
        theme: 'light'
      });
    }

    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  return (
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <div id="incaptcha-container" ref={containerRef}></div>
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Vue.js

```vue
<template>
  <form>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <div id="incaptcha-widget"></div>
    <button type="submit">Sign In</button>
  </form>
</template>

<script>
import { CheckboxWidget } from 'incaptch';

export default {
  mounted() {
    this.widget = new CheckboxWidget('incaptcha-widget', {
      siteKey: 'your_site_key_here',
      onVerify: (token) => {
        console.log('Token:', token);
      },
      theme: 'dark'
    });
  },
  beforeUnmount() {
    this.widget?.destroy();
  }
}
</script>
```

## Backend Verification

After receiving the token from the widget, verify it on your backend:

```javascript
// Node.js example
const response = await fetch('https://your-incaptcha-instance.com/api/incaptcha/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ verifyToken: token })
});

const result = await response.json();
if (result.valid) {
  // User is verified
  console.log('Score:', result.score);
} else {
  // Verification failed
  console.error('Invalid captcha');
}
```

## API

### `CheckboxWidget(elementId, options)`

Creates a new checkbox widget instance.

**Parameters:**
- `elementId` (string): The ID of the HTML element to render the widget in
- `options` (object):
  - `siteKey` (string, required): Your InCaptcha site key
  - `onVerify` (function, optional): Callback called with verification token
  - `onError` (function, optional): Callback called on errors
  - `theme` ('light' | 'dark', optional): Widget theme (default: 'light')
  - `apiBaseUrl` (string, optional): API endpoint URL (default: same origin)

**Methods:**
- `destroy()`: Unmounts and cleans up the widget

## Getting Your Site Key

1. Sign up at your InCaptcha instance
2. Navigate to the Keys page
3. Create a new site key
4. Copy the site key (starts with `sk_...`)
5. **Save the secret key** - it's shown only once!

## License

MIT
