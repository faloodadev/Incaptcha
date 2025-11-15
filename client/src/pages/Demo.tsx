import { useState } from 'react';
import { motion } from 'framer-motion';
import { TurnstileCheckbox } from '@/components/incaptcha/TurnstileCheckbox';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Menu, Shield, Zap, Brain, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Demo() {
  const [verifyToken, setVerifyToken] = useState<string | null>(null);

  const handleSuccess = (token: string) => {
    setVerifyToken(token);
    console.log('Verification successful! Token:', token);
  };

  const handleError = (error: string) => {
    console.error('Verification error:', error);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header - OpenAI Style */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/">
                <div className="flex items-center gap-3 hover-elevate px-2 py-1 rounded-md transition-all cursor-pointer">
                  <img 
                    src="/incaptcha.png" 
                    alt="InCaptcha" 
                    className="h-8 w-auto"
                    data-testid="img-logo"
                  />
                  <span className="text-xl font-bold text-foreground">InCaptcha</span>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" data-testid="link-home">
                    Docs
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" size="sm" data-testid="link-admin">
                    API
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Hero Section - Clean and Simple */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            InCaptcha Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Make your first verification request in minutes. Learn the basics of the InCaptcha platform.
          </p>
        </motion.div>

        {/* CAPTCHA Verification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-6xl mx-auto mb-20"
        >
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Verification Methods</h2>
            <p className="text-muted-foreground">
              Choose from multiple verification types to protect your application.
            </p>
          </div>

          {/* CAPTCHA Card */}
          <div className="flex justify-center">
            {/* Turnstile Checkbox */}
            <Card className="p-8 w-full max-w-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Checkbox Verification</h3>
              <div className="bg-muted/50 rounded-lg p-8">
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Before you proceed, please complete the captcha below.
                </p>
                <TurnstileCheckbox
                  siteKey="demo_site_key"
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
            </Card>
          </div>

          {/* Verification Token Display */}
          {verifyToken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-muted p-2 rounded-lg">
                    <Lock className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Verification Token
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Single-use JWT token
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <code className="block font-mono text-sm break-all text-foreground" data-testid="text-verify-token">
                    {verifyToken}
                  </code>
                </div>

                <p className="text-sm text-muted-foreground">
                  This token can be verified server-side to confirm challenge completion.
                  Expires in 180 seconds with replay protection.
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Features Section with Gradient Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-6xl mx-auto mb-20"
        >
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Features</h2>
            <p className="text-muted-foreground">
              Built for scale, designed for security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Behavioral Analysis',
                description: 'Advanced machine learning tracks mouse movements, timing patterns, and interaction behaviors to detect automated bots.',
                gradient: 'from-pink-500/10 via-orange-500/10 to-yellow-500/10'
              },
              {
                icon: Shield,
                title: 'Semantic Verification',
                description: 'Server-side AI validates challenge solutions ensuring genuine human responses while maintaining privacy.',
                gradient: 'from-purple-500/10 via-pink-500/10 to-purple-500/10'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized for performance with response times under 100ms and zero impact on user experience.',
                gradient: 'from-blue-500/10 via-cyan-500/10 to-teal-500/10'
              },
              {
                icon: Lock,
                title: 'Cryptographic Security',
                description: 'JWT-based tokens with HMAC-SHA512 signatures, single-use enforcement, and automatic expiration.',
                gradient: 'from-green-500/10 via-emerald-500/10 to-teal-500/10'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full p-6 hover-elevate transition-all duration-300">
                  <div className={`bg-gradient-to-br ${feature.gradient} rounded-lg p-8 mb-4`}>
                    <feature.icon className="w-8 h-8 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Get Started CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Card className="p-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Get started
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Ready to integrate InCaptcha into your application?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admin">
                <Button size="lg" data-testid="button-get-started">
                  View Dashboard
                </Button>
              </Link>
              <Button size="lg" variant="outline" data-testid="button-documentation">
                Documentation
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
