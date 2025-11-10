import { useState } from 'react';
import { motion } from 'framer-motion';
import { InCaptchaWidget } from '@/components/incaptcha/InCaptchaWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Demo() {
  const { theme } = useTheme();
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [showWidget, setShowWidget] = useState(true);

  const handleSuccess = (token: string) => {
    setVerifyToken(token);
    console.log('Verification successful! Token:', token);
  };

  const handleError = (error: string) => {
    console.error('Verification error:', error);
  };

  const handleReset = () => {
    setVerifyToken(null);
    setShowWidget(false);
    setTimeout(() => setShowWidget(true), 100);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'macos' 
        ? 'bg-gradient-to-br from-background via-background to-accent/10' 
        : 'bg-background'
    }`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-home">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" data-testid="link-admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={`text-5xl font-bold mb-4 ${
            theme === 'macos' 
              ? 'bg-gradient-to-r from-primary via-primary to-chart-1 bg-clip-text text-transparent' 
              : 'text-foreground'
          }`}>
            InCaptcha Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience next-generation CAPTCHA verification with AI-powered behavioral analysis
            and beautiful dual themes
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Card className="px-4 py-2 text-sm">
              <span className="text-muted-foreground">Current Theme:</span>{' '}
              <span className="font-semibold text-primary">
                {theme === 'macos' ? 'macOS Frosted Glass' : 'Discord Dark'}
              </span>
            </Card>
          </div>
        </motion.div>

        {/* Widget Demo */}
        <div className="max-w-2xl mx-auto">
          {showWidget && (
            <InCaptchaWidget
              siteKey="demo_site_key"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {/* Result Display */}
          {verifyToken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className={`p-6 ${
                theme === 'macos' 
                  ? 'bg-card/80 backdrop-blur-xl border-card-border shadow-lg' 
                  : 'bg-card border-card-border'
              }`}>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Verification Token
                </h3>
                <div className="bg-muted/50 rounded-md p-4 mb-4 font-mono text-sm break-all">
                  <code className="text-primary" data-testid="text-verify-token">
                    {verifyToken}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This token can be verified server-side to confirm the user completed the CAPTCHA challenge.
                  Each token is single-use and expires after 180 seconds.
                </p>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  data-testid="button-try-again"
                >
                  Try Another Challenge
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[
              {
                title: 'Behavioral Analysis',
                description: 'Tracks mouse movements, timing, and interaction patterns to detect bots'
              },
              {
                title: 'AI Verification',
                description: 'Server-side semantic verification ensures challenge solutions are valid'
              },
              {
                title: 'Dual Themes',
                description: 'Beautiful macOS frosted-glass or Discord dark theme'
              },
              {
                title: 'Secure Tokens',
                description: 'JWT-based single-use tokens with replay protection and expiration'
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`p-4 hover-elevate transition-all ${
                  theme === 'macos' 
                    ? 'bg-card/60 backdrop-blur-md' 
                    : 'bg-card'
                }`}
              >
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
