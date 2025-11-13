import { useState } from 'react';
import { motion } from 'framer-motion';
import { InCaptchaWidget } from '@/components/incaptcha/InCaptchaWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Home, Settings, Shield, Sparkles, Zap, Brain, Lock, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-gradient-to-l from-secondary/20 to-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"
        />
      </div>

      {/* Header with Glassmorphism */}
      <header className="relative border-b border-white/10 glass-strong backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-md opacity-50" />
                  <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-lg font-bold gradient-text">InCaptcha</span>
              </motion.div>
              
              <nav className="hidden md:flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-sm" data-testid="link-home">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-sm" data-testid="link-admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium gradient-text">AI-Powered Verification</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="gradient-text">InCaptcha</span>
            <br />
            <span className="text-foreground">Verification Platform</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Experience next-generation CAPTCHA with advanced behavioral analysis,
            holographic UI design, and enterprise-grade security
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { label: 'Detection Rate', value: '99.8%', icon: Shield },
              { label: 'Response Time', value: '<100ms', icon: Zap },
              { label: 'AI Accuracy', value: '98.5%', icon: Brain },
            ].map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg blur-sm" />
                  <div className="relative glass p-2 rounded-lg">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Widget Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-2xl mx-auto mb-16"
        >
          {showWidget && (
            <InCaptchaWidget
              siteKey="demo_site_key"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {/* Result Display with Holographic Effect */}
          {verifyToken && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mt-8"
            >
              <div className="relative holo-border rounded-xl overflow-hidden">
                <Card className="relative border-0 glass-strong p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-md opacity-50" />
                        <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-full">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Verification Token
                        </h3>
                        <p className="text-sm text-muted-foreground">Single-use JWT token</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="glass px-3 py-1 rounded-full"
                    >
                      <span className="text-xs font-medium gradient-text">Active</span>
                    </motion.div>
                  </div>

                  <div className="relative glass rounded-lg p-4 mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
                    <code className="relative block font-mono text-sm break-all gradient-text" data-testid="text-verify-token">
                      {verifyToken}
                    </code>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    This token can be verified server-side to confirm challenge completion.
                    Expires in 180 seconds with replay protection.
                  </p>

                  <Button
                    onClick={handleReset}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white group relative overflow-hidden"
                    data-testid="button-try-again"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      Try Another Challenge
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              <span className="gradient-text">Enterprise Features</span>
            </h2>
            <p className="text-muted-foreground">
              Built for scale, designed for security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Brain,
                title: 'AI Behavioral Analysis',
                description: 'Advanced machine learning tracks mouse movements, timing patterns, and interaction behaviors to detect automated bots with 99.8% accuracy'
              },
              {
                icon: Shield,
                title: 'Semantic Verification',
                description: 'Server-side AI validates challenge solutions ensuring genuine human responses while maintaining privacy and security standards'
              },
              {
                icon: Sparkles,
                title: 'Holographic UI',
                description: 'Cutting-edge 2025 design language with minimal glassmorphism, animated gradients, and fluid motion for premium user experience'
              },
              {
                icon: Lock,
                title: 'Cryptographic Security',
                description: 'JWT-based tokens with HMAC-SHA512 signatures, single-use enforcement, and automatic expiration for maximum security'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="relative group holo-border rounded-xl h-full">
                  <Card className="relative h-full border-0 glass-strong p-6 hover-elevate transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative glass p-3 rounded-lg">
                            <feature.icon className="w-6 h-6 text-primary" />
                          </div>
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16 max-w-3xl mx-auto"
        >
          <div className="relative holo-border rounded-2xl overflow-hidden">
            <Card className="relative border-0 glass-strong p-12">
              <div className="absolute inset-0 holo-bg opacity-30" />
              <div className="relative">
                <h3 className="text-3xl font-bold gradient-text mb-4">
                  Ready to Secure Your Platform?
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Join thousands of developers protecting their applications with InCaptcha
                </p>
                <Link href="/admin">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary text-white group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      View Admin Dashboard
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
