import { useState, useEffect } from 'react';
import type { CheckboxOptions } from './types';
import { InCaptchaAPI } from './api';

export function CheckboxWidget({
  siteKey,
  onVerify,
  onError,
  theme = 'light',
  apiBaseUrl,
}: CheckboxOptions) {
  const [api] = useState(() => new InCaptchaAPI(apiBaseUrl));
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    async function init() {
      try {
        const session = await api.initSession(siteKey);
        setSessionId(session.sessionId);
        setNonce(session.nonce);
        setStartTime(Date.now());
        setIsLoading(false);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Failed to initialize captcha');
        setIsLoading(false);
      }
    }
    init();
  }, [siteKey, api, onError]);

  const handleCheckboxClick = async () => {
    if (isChecked || !nonce || isVerifying) return;

    setIsVerifying(true);
    const clickTime = Date.now();
    const timeToClick = clickTime - startTime;

    const behaviorVector = [
      timeToClick,
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 50,
      Date.now() % 1000,
    ];

    try {
      const result = await api.verifyCheckbox(nonce, behaviorVector);
      if (result.success && result.verifyToken) {
        setIsChecked(true);
        onVerify(result.verifyToken);
      } else {
        onError?.(result.error || 'Verification failed');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    border: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
    borderRadius: '8px',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    border: `2px solid ${isChecked ? '#0070f3' : theme === 'dark' ? '#555' : '#ccc'}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isVerifying || isChecked ? 'default' : 'pointer',
    backgroundColor: isChecked ? '#0070f3' : 'transparent',
    transition: 'all 0.2s',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    color: theme === 'dark' ? '#fff' : '#000',
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...checkboxStyle, borderColor: '#ccc' }}>
          <span style={{ fontSize: '12px' }}>...</span>
        </div>
        <span style={textStyle}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={checkboxStyle} onClick={handleCheckboxClick}>
        {isVerifying && <span style={{ fontSize: '12px' }}>...</span>}
        {isChecked && !isVerifying && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span style={textStyle}>
        {isVerifying ? 'Verifying...' : isChecked ? 'Verified' : "I'm not a robot"}
      </span>
    </div>
  );
}
