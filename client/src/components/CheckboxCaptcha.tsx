import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface CheckboxCaptchaProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function CheckboxCaptcha({
  siteKey = "demo_site_key",
  onVerify,
  onError,
  className = "",
}: CheckboxCaptchaProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const initMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/captcha/checkbox/init", { siteKey });
    },
    onSuccess: (data: any) => {
      setSessionId(data.sessionId);
      setNonce(data.nonce);
      setStartTime(Date.now());
    },
    onError: (error: any) => {
      onError?.(error.message || "Failed to initialize captcha");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ nonce, behaviorVector }: { nonce: string; behaviorVector: number[] }) => {
      return await apiRequest("POST", "/api/captcha/checkbox/verify", { nonce, behaviorVector });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setVerifyToken(data.verifyToken);
        setIsChecked(true);
        onVerify(data.verifyToken);
      } else {
        onError?.(data.error || "Verification failed");
      }
    },
    onError: (error: any) => {
      onError?.(error.message || "Failed to verify captcha");
      setIsChecked(false);
    },
  });

  useEffect(() => {
    initMutation.mutate();
  }, []);

  const handleCheckboxClick = () => {
    if (verifyToken || isChecked) return;

    const clickTime = Date.now();
    const timeToClick = clickTime - startTime;

    const behaviorVector = [
      timeToClick,
      Math.random() * 100,
      Math.random() * 100, 
      Math.random() * 50,
      Date.now() % 1000,
    ];

    if (nonce) {
      verifyMutation.mutate({ nonce, behaviorVector });
    }
  };

  if (initMutation.isPending) {
    return (
      <div className={`flex items-center gap-2 p-4 border rounded-md ${className}`} data-testid="captcha-loading">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-md hover-elevate ${className}`} data-testid="captcha-widget">
      <button
        type="button"
        onClick={handleCheckboxClick}
        disabled={verifyMutation.isPending || isChecked}
        className={`flex items-center justify-center w-6 h-6 border-2 rounded-sm transition-colors ${
          isChecked
            ? "bg-primary border-primary"
            : "border-border hover:border-primary"
        }`}
        data-testid="checkbox-captcha"
      >
        {verifyMutation.isPending && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}
        {isChecked && !verifyMutation.isPending && (
          <svg
            className="w-4 h-4 text-primary-foreground"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        )}
      </button>
      <span className="text-sm text-foreground">
        {verifyMutation.isPending ? "Verifying..." : isChecked ? "Verified" : "I'm not a robot"}
      </span>
    </div>
  );
}
