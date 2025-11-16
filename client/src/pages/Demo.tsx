import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Puzzle, TrendingUp, Network, Copy, Check, Twitter, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Demo() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const codeSnippet = `<script src="https://incaptcha-net.js"></script>
<div class="incaptcha-widget"></div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md transition-all cursor-pointer">
                <img 
                  src="/incaptcha.png" 
                  alt="incaptcha" 
                  className="h-6 w-auto"
                  data-testid="img-logo"
                />
                <span className="text-lg font-semibold text-foreground">incaptcha</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/docs">
                <Button variant="ghost" size="sm" data-testid="link-docs">
                  Docs
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="sm" data-testid="link-pricing">
                  Pricing
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost" size="sm" data-testid="link-support">
                  Support
                </Button>
              </Link>
            </nav>
            
            <div className="flex items-center gap-2">
              <Link href="/keys">
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                  size="sm" 
                  data-testid="button-get-api-key"
                >
                  Get API Key
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16 sm:mb-24"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight leading-tight">
            Protect Your Site from Bots with incaptcha
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
            Industry-leading CAPTCHA solution for websites and applications.
          </p>
          
          <Link href="/demo-login">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white mb-6"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </Link>
          
          <ul className="space-y-2 text-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground"></span>
              Privacy-first
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground"></span>
              AI-powered challenge
            </li>
          </ul>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-5xl mb-16 sm:mb-24"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Puzzle,
                title: 'Easy Integration',
                description: 'Quick setup with minimal code',
              },
              {
                icon: TrendingUp,
                title: 'Low Latency',
                description: 'Fast verification process',
              },
              {
                icon: Network,
                title: 'AI-powered',
                description: 'Advanced bot detection',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-lg bg-blue-500/10">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Start Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Quick Start</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Embed in in your form</p>
          
          <Card className="relative overflow-hidden">
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                data-testid="button-copy-code"
                className="text-xs sm:text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 sm:p-6 pt-12 sm:pt-14">
              <pre className="text-xs sm:text-sm text-foreground font-mono overflow-x-auto">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 sm:mt-24 lg:mt-32">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <nav className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <Link href="/docs">
                <Button variant="ghost" size="sm" data-testid="link-footer-docs">
                  Docs
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="ghost" size="sm" data-testid="link-footer-faq">
                  FAQ
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="ghost" size="sm" data-testid="link-footer-terms">
                  Terms
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="ghost" size="sm" data-testid="link-footer-privacy">
                  Privacy
                </Button>
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-github"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
