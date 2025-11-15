
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
import { CheckCircle, Lock, Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { CheckboxWidget } from "../../../packages/incaptch/src/CheckboxWidget";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function DemoLogin() {
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<CheckboxWidget | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize the incaptch CheckboxWidget
  useEffect(() => {
    if (widgetContainerRef.current && !widgetInstanceRef.current) {
      widgetInstanceRef.current = new CheckboxWidget('incaptcha-checkbox-container', {
        siteKey: 'demo_site_key',
        onVerify: (token: string) => {
          setVerifyToken(token);
          toast({
            title: "Verification Successful",
            description: "You can now proceed with login",
          });
        },
        onError: (error: string) => {
          toast({
            title: "Verification Error",
            description: error,
            variant: "destructive",
          });
        },
        theme: 'light',
        apiBaseUrl: ''
      });
    }

    return () => {
      if (widgetInstanceRef.current) {
        widgetInstanceRef.current.destroy();
        widgetInstanceRef.current = null;
      }
    };
  }, [toast]);

  const onSubmit = async (data: LoginFormValues) => {
    if (!verifyToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login Successful!",
      description: `Welcome back! Token: ${verifyToken.substring(0, 20)}...`,
    });
    
    setIsLoggedIn(true);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Login Successful!</CardTitle>
            <CardDescription>
              You have been successfully authenticated with InCaptcha protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground mb-2">Verify Token:</p>
                <code className="text-xs break-all font-mono" data-testid="text-verify-token">{verifyToken}</code>
              </div>
              <div className="flex gap-2">
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
                <Link href="/">
                  <Button variant="default" className="flex-1" data-testid="button-back-home">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to InCaptcha
            </Button>
          </Link>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Demo Login</CardTitle>
            <CardDescription>
              Experience InCaptcha checkbox verification using the incaptch package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                            type="password"
                            placeholder="Enter password"
                            className="pl-10"
                            data-testid="input-password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  {/* InCaptcha Checkbox Widget Container */}
                  <div 
                    id="incaptcha-checkbox-container" 
                    ref={widgetContainerRef}
                  ></div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!verifyToken}
                  data-testid="button-login"
                >
                  Sign In
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Using <code className="bg-muted px-1 py-0.5 rounded">incaptch</code> package with API key: <code className="bg-muted px-1 py-0.5 rounded">demo_site_key</code>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
