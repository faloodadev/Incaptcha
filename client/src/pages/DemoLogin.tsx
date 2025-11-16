
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Lock, Mail, ArrowLeft, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckboxWidget } from "incaptch";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function DemoLogin() {
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const { toast } = useToast();
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<CheckboxWidget | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize the CheckboxWidget from incaptch package
  useEffect(() => {
    if (captchaContainerRef.current && !widgetRef.current && !isLoggedIn) {
      widgetRef.current = new CheckboxWidget('incaptcha-container', {
        siteKey: 'demo_site_key',
        onVerify: handleSuccess,
        onError: handleError,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        apiBaseUrl: '' // Uses same origin
      });
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
    };
  }, [isLoggedIn]);

  const handleSuccess = (token: string) => {
    setVerifyToken(token);
    
    // Determine security level based on token (simulated)
    const score = Math.random();
    if (score > 0.8) {
      setSecurityLevel('high');
    } else if (score > 0.5) {
      setSecurityLevel('medium');
    } else {
      setSecurityLevel('low');
    }
    
    toast({
      title: "Verification Successful",
      description: "InCaptcha has verified you're human. You can now proceed with login.",
    });
  };

  const handleError = (error: string) => {
    toast({
      title: "Verification Error",
      description: error,
      variant: "destructive",
    });
    setVerifyToken(null);
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (!verifyToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the InCaptcha verification first",
        variant: "destructive",
      });
      return;
    }

    // Verify the token with the backend
    try {
      const response = await fetch('/api/incaptcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifyToken })
      });

      const result = await response.json();

      if (result.valid) {
        toast({
          title: "Login Successful!",
          description: `Welcome back! Security score: ${result.score}`,
        });
        
        setIsLoggedIn(true);
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Token validation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify captcha token",
        variant: "destructive",
      });
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl">Login Successful!</CardTitle>
                <CardDescription className="mt-2">
                  You have been securely authenticated with InCaptcha protection
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Badge */}
              <div className={`p-4 rounded-lg border-2 ${
                securityLevel === 'high' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' :
                securityLevel === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' :
                'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
              }`}>
                <div className="flex items-center gap-3">
                  <Shield className={`w-6 h-6 ${
                    securityLevel === 'high' ? 'text-green-600 dark:text-green-400' :
                    securityLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      securityLevel === 'high' ? 'text-green-900 dark:text-green-100' :
                      securityLevel === 'medium' ? 'text-yellow-900 dark:text-yellow-100' :
                      'text-orange-900 dark:text-orange-100'
                    }`}>
                      {securityLevel === 'high' ? 'High Security Level' :
                       securityLevel === 'medium' ? 'Medium Security Level' :
                       'Standard Security Level'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      securityLevel === 'high' ? 'text-green-700 dark:text-green-300' :
                      securityLevel === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-orange-700 dark:text-orange-300'
                    }`}>
                      Verified using InCaptcha behavioral analysis
                    </p>
                  </div>
                </div>
              </div>

              {/* Token Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Verification Token</label>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <code className="text-xs break-all font-mono text-foreground" data-testid="text-verify-token">
                    {verifyToken}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground">
                  This token was verified server-side using the InCaptcha API
                </p>
              </div>

              {/* Security Features */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Security Features Applied</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Behavioral Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Device Fingerprint</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Risk Scoring</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Token Verification</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setVerifyToken(null);
                    form.reset();
                  }}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-try-again"
                >
                  Try Again
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="default" className="w-full" data-testid="button-back-home">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Demos
                  </Button>
                </Link>
              </div>

              {/* Integration Info */}
              <div className="pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  Using <code className="bg-muted px-1.5 py-0.5 rounded font-semibold">incaptch</code> package
                  {' '}• Site Key: <code className="bg-muted px-1.5 py-0.5 rounded">demo_site_key</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to InCaptcha
            </Button>
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Demo Login</CardTitle>
                  <CardDescription className="mt-1">
                    Protected by InCaptcha Security
                  </CardDescription>
                </div>
              </div>

              {/* Info Banner */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    This demo uses the <code className="font-semibold bg-background/50 px-1 rounded">incaptch</code> package with behavioral analysis, 
                    device fingerprinting, and server-side token verification for maximum security.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="demo@example.com"
                              className="pl-10"
                              data-testid="input-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                              data-testid="input-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* InCaptcha Verification Widget */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Security Verification</label>
                    <div className="flex justify-center">
                      <div id="incaptcha-container" ref={captchaContainerRef}></div>
                    </div>
                    <AnimatePresence>
                      {verifyToken && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                            Verified - You can now sign in
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!verifyToken}
                    data-testid="button-login"
                    size="lg"
                  >
                    {verifyToken ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Sign In Securely
                      </>
                    ) : (
                      'Complete Verification First'
                    )}
                  </Button>

                  {/* Helper Text */}
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Protected by <span className="font-semibold">InCaptcha</span> with advanced bot detection
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Behavioral AI
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Device Trust
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Server Validation
                      </span>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Details */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Integration Details
                </span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Package:</span>
                  <code className="font-semibold">incaptch@latest</code>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Site Key:</span>
                  <code className="font-semibold">demo_site_key</code>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Verify Endpoint:</span>
                  <code className="font-semibold">/api/incaptcha/verify</code>
                </div>
                <div className="flex justify-between py-1">
                  <span>Token Type:</span>
                  <code className="font-semibold">HMAC-SHA512 JWT</code>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
