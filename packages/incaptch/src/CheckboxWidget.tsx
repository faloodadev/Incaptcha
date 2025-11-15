
import { StrictMode, useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

interface MouseSample {
  t: number;
  x: number;
  y: number;
}

interface BehaviorVector {
  mouseTrajectory: MouseSample[];
  clickLatency: number;
  hoverDuration: number;
  mouseVelocity: number;
  timestamp: number;
  scrollBehavior: { scrollY: number; scrollVelocity: number };
}

interface CheckboxWidgetProps {
  siteKey: string;
  onVerify?: (token: string) => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  apiBaseUrl?: string;
}

function CheckboxComponent({ siteKey, onVerify, onError, theme = 'light', apiBaseUrl = '' }: CheckboxWidgetProps) {
  const [state, setState] = useState<'idle' | 'prechecked' | 'verifying' | 'success' | 'error'>('idle');
  const resetTimerRef = useRef<number | null>(null);

  // Behavioral tracking state
  const mouseTrajectory = useRef<MouseSample[]>([]);
  const hoverStartTime = useRef<number>(0);
  const pageLoadTime = useRef<number>(Date.now());
  const lastScrollY = useRef<number>(window.scrollY);
  const lastScrollTime = useRef<number>(Date.now());

  const getBehaviorVector = useCallback((): BehaviorVector => {
    const now = Date.now();
    const scrollVelocity = lastScrollTime.current > 0 
      ? (window.scrollY - lastScrollY.current) / ((now - lastScrollTime.current) / 1000)
      : 0;

    let totalVelocity = 0;
    for (let i = 1; i < mouseTrajectory.current.length; i++) {
      const prev = mouseTrajectory.current[i - 1];
      const curr = mouseTrajectory.current[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dt = (curr.t - prev.t) / 1000;
      if (dt > 0) {
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
        totalVelocity += velocity;
      }
    }
    const avgVelocity = mouseTrajectory.current.length > 1 
      ? totalVelocity / (mouseTrajectory.current.length - 1) 
      : 0;

    return {
      mouseTrajectory: mouseTrajectory.current.slice(-20),
      clickLatency: now - pageLoadTime.current,
      hoverDuration: hoverStartTime.current > 0 ? now - hoverStartTime.current : 0,
      mouseVelocity: avgVelocity,
      timestamp: now,
      scrollBehavior: {
        scrollY: window.scrollY,
        scrollVelocity: scrollVelocity
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    mouseTrajectory.current.push({
      t: now,
      x: e.clientX,
      y: e.clientY
    });

    if (mouseTrajectory.current.length > 50) {
      mouseTrajectory.current = mouseTrajectory.current.slice(-50);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    hoverStartTime.current = Date.now();
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverStartTime.current = 0;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (state !== 'idle') return;

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    setState('prechecked');

    setTimeout(async () => {
      setState('verifying');
      
      try {
        const response = await fetch(`${apiBaseUrl}/api/incaptcha/turnstile/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteKey,
            behaviorVector: getBehaviorVector()
          })
        });

        const data = await response.json();

        if (data.success && data.verifyToken) {
          setState('success');
          onVerify?.(data.verifyToken);
        } else {
          setState('error');
          onError?.('Verification failed');
          resetTimerRef.current = window.setTimeout(() => {
            setState('idle');
          }, 2000);
        }
      } catch (error) {
        setState('error');
        onError?.('Network error');
        resetTimerRef.current = window.setTimeout(() => {
          setState('idle');
        }, 2000);
      }
    }, 150);
  }, [state, siteKey, apiBaseUrl, getBehaviorVector, onVerify, onError]);

  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'inline-block' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '300px',
          backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
          border: `1px solid ${isDark ? '#333' : '#d4d9e3'}`,
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onMouseMove={handleMouseMove as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleClick}
                disabled={state !== 'idle'}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  border: `2px solid ${
                    state === 'idle' ? (isDark ? '#555' : '#e1e5f0') :
                    state === 'prechecked' ? '#4b7cf5' :
                    state === 'verifying' ? '#4b7cf5' :
                    state === 'success' ? '#2cb77d' :
                    '#f87171'
                  }`,
                  borderRadius: '4px',
                  backgroundColor: state === 'verifying' ? '#4b7cf5' : state === 'success' ? '#2cb77d' : state === 'error' ? '#f87171' : isDark ? '#2a2a2a' : 'white',
                  cursor: state === 'idle' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                {state === 'prechecked' && <span style={{ color: '#4b7cf5', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                {state === 'verifying' && <span style={{ color: 'white', fontSize: '12px' }}>⟳</span>}
                {state === 'success' && <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                {state === 'error' && <span style={{ color: 'white', fontSize: '18px' }}>!</span>}
              </button>

              <span style={{ fontSize: '15px', color: isDark ? '#e0e0e0' : '#1f2937' }}>
                I am human
              </span>
            </div>

            <img 
              src="https://i.imgur.com/your-logo.png" 
              alt="InCaptcha" 
              style={{ height: '32px', width: 'auto' }}
            />
          </div>
        </div>

        <div style={{
          borderTop: `1px solid ${isDark ? '#333' : '#e5e9f2'}`,
          padding: '10px 16px',
          backgroundColor: isDark ? '#252525' : '#fafbfc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: isDark ? '#999' : '#6b7280' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
            <span>-</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: isDark ? '#aaa' : '#4a5466' }}>
            InCaptcha
          </span>
        </div>
      </div>
    </div>
  );
}

export class CheckboxWidget {
  private container: HTMLElement | null = null;
  private root: any = null;

  constructor(
    elementId: string,
    options: CheckboxWidgetProps
  ) {
    this.container = document.getElementById(elementId);
    
    if (!this.container) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    this.root = createRoot(this.container);
    this.render(options);
  }

  private render(options: CheckboxWidgetProps) {
    this.root.render(
      <StrictMode>
        <CheckboxComponent {...options} />
      </StrictMode>
    );
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
