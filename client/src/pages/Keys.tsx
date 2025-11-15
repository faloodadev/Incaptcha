import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Key, Copy, Plus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  publicKey: string;
  createdAt: string;
  active: boolean;
}

export default function Keys() {
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { data: keys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/keys'],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest<ApiKey & { secretKey: string }>('POST', '/api/keys/create', { name });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      setNewKeyName('');
      
      // Show the secret key immediately - this is the ONLY time it will be shown
      toast({
        title: 'API Key Created Successfully!',
        description: (
          <div className="space-y-2">
            <p>Your secret key: <code className="text-xs bg-muted px-2 py-1 rounded">{data.secretKey}</code></p>
            <p className="text-destructive font-semibold">⚠️ Save this now! It won't be shown again.</p>
          </div>
        ),
        duration: 10000,
      });
      
      // Auto-copy to clipboard
      navigator.clipboard.writeText(data.secretKey || '');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API key',
        variant: 'destructive',
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return apiRequest('DELETE', `/api/keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been successfully deleted.',
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return '•'.repeat(key.length);
    return key.substring(0, 8) + '•'.repeat(24) + key.substring(key.length - 8);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background">
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
                <Link href="/docs">
                  <Button variant="ghost" size="sm" data-testid="link-docs">
                    Docs
                  </Button>
                </Link>
                <Link href="/api-reference">
                  <Button variant="ghost" size="sm" data-testid="link-api">
                    API
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">API Keys</h1>
          <p className="text-lg text-muted-foreground">
            Manage your InCaptcha API keys for authentication and verification.
          </p>
        </div>

        {/* Create New Key */}
        <Card className="p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Create New API Key
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a new site key for your application. Keep your secret key secure.
              </p>
              <div className="flex gap-3">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="key-name" className="text-sm font-medium mb-2 block">
                    Key Name
                  </Label>
                  <Input
                    id="key-name"
                    placeholder="Production Website"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    data-testid="input-key-name"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => newKeyName && createKeyMutation.mutate(newKeyName)}
                    disabled={!newKeyName || createKeyMutation.isPending}
                    data-testid="button-create-key"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Key
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* API Keys List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Your API Keys</h2>
          
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading API keys...</p>
            </Card>
          ) : keys && keys.length > 0 ? (
            <div className="space-y-3">
              {keys.map((key) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`card-api-key-${key.id}`}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-md">
                            <Key className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground" data-testid={`text-key-name-${key.id}`}>
                              {key.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(key.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Site Key (Public)
                            </Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono" data-testid={`text-site-key-${key.id}`}>
                                {key.key}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(key.key, 'Site key')}
                                data-testid={`button-copy-site-key-${key.id}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Secret Key (Keep Private)
                            </Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono" data-testid={`text-secret-key-${key.id}`}>
                                {showKeys[key.id] ? key.publicKey : maskKey(key.publicKey)}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleKeyVisibility(key.id)}
                                data-testid={`button-toggle-visibility-${key.id}`}
                              >
                                {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(key.publicKey, 'Secret key')}
                                data-testid={`button-copy-secret-key-${key.id}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          <AlertCircle className="w-4 h-4" />
                          <span>Never expose your secret key in client-side code or public repositories.</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteKeyMutation.mutate(key.id)}
                        disabled={deleteKeyMutation.isPending}
                        data-testid={`button-delete-key-${key.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                  <Key className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No API Keys Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first API key to start integrating InCaptcha into your application.
                </p>
                <Button
                  onClick={() => document.getElementById('key-name')?.focus()}
                  data-testid="button-create-first-key"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Key
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">How to Use Your API Keys</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Frontend Integration:</p>
              <Card className="bg-muted/50 p-4 mt-2">
                <pre className="text-xs overflow-x-auto">
                  <code>{`<script src="https://cdn.incaptcha.com/widget.js"></script>
<div id="incaptcha-widget" 
     data-sitekey="your_site_key">
</div>`}</code>
                </pre>
              </Card>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Backend Verification:</p>
              <Card className="bg-muted/50 p-4 mt-2">
                <pre className="text-xs overflow-x-auto">
                  <code>{`fetch('https://api.incaptcha.com/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_secret_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userToken: token
  })
})`}</code>
                </pre>
              </Card>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
