import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, X, ChevronRight, Shield, Code, Key, BookOpen, Zap } from 'lucide-react';

export default function Docs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - OpenAI Platform Style */}
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
              <Link href="/keys">
                <Button variant="outline" size="sm" data-testid="button-api-keys">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </Button>
              </Link>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-menu"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - OpenAI Platform Style */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:sticky top-[57px] left-0 bottom-0
          w-64 bg-card border-r border-border
          transition-transform duration-200 z-40
        `}>
          <ScrollArea className="h-[calc(100vh-57px)] p-4">
            <nav className="space-y-1">
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Get started
                </p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="link-overview">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Overview
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="link-quickstart">
                    <Zap className="w-4 h-4 mr-2" />
                    Quickstart
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Core concepts
                </p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="link-verification">
                    <Shield className="w-4 h-4 mr-2" />
                    Verification Methods
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="link-security">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Features
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Integration
                </p>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="link-code-examples">
                    <Code className="w-4 h-4 mr-2" />
                    Code Examples
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="link-api-keys">
                    <Key className="w-4 h-4 mr-2" />
                    API Keys
                  </Button>
                </div>
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content - OpenAI Platform Style */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto p-8">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-foreground mb-4">
                InCaptcha Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Developer quickstart
              </p>
              <p className="text-lg text-foreground mb-6">
                Make your first verification request in minutes. Learn the basics of the InCaptcha platform.
              </p>
              <Link href="#get-started">
                <Button size="lg" data-testid="button-get-started">
                  Get started
                </Button>
              </Link>
            </div>

            {/* Code Example Section */}
            <Tabs defaultValue="javascript" className="mb-12">
              <TabsList data-testid="tabs-language">
                <TabsTrigger value="javascript" data-testid="tab-javascript">javascript</TabsTrigger>
                <TabsTrigger value="python" data-testid="tab-python">python</TabsTrigger>
                <TabsTrigger value="curl" data-testid="tab-curl">curl</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="mt-4">
                <Card className="bg-muted/50 p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code className="text-foreground">{`import InCaptcha from "incaptcha";

const client = new InCaptcha(process.env.INCAPTCHA_API_KEY);

async function verifyUser() {
  const verification = await client.verify({
    siteKey: "your_site_key",
    userToken: "user_response_token"
  });
  
  if (verification.success) {
    console.log("User verified!", verification.score);
  }
}`}</code>
                  </pre>
                </Card>
              </TabsContent>

              <TabsContent value="python" className="mt-4">
                <Card className="bg-muted/50 p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code className="text-foreground">{`import incaptcha

client = incaptcha.Client(api_key="INCAPTCHA_API_KEY")

verification = client.verify(
    site_key="your_site_key",
    user_token="user_response_token"
)

if verification.success:
    print(f"User verified! Score: {verification.score}")`}</code>
                  </pre>
                </Card>
              </TabsContent>

              <TabsContent value="curl" className="mt-4">
                <Card className="bg-muted/50 p-6">
                  <pre className="text-sm overflow-x-auto">
                    <code className="text-foreground">{`curl https://api.incaptcha.com/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "siteKey": "your_site_key",
    "userToken": "user_response_token"
  }'`}</code>
                  </pre>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Advanced Security
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Multi-layered bot detection with behavioral analysis, device fingerprinting, and risk scoring.
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto" data-testid="link-learn-security">
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Adaptive Challenges
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatic escalation from simple checkbox to puzzle challenges based on risk assessment.
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto" data-testid="link-learn-challenges">
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Easy Integration
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Simple JavaScript embed or full REST API. Works with any framework or platform.
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto" data-testid="link-learn-integration">
                      View examples
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover-elevate">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Key className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Secure by Default
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ed25519 signed JWT tokens, rate limiting, and enterprise-grade security built-in.
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto" data-testid="link-learn-security-features">
                      Security features
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Next Steps */}
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Next steps</h2>
              <div className="space-y-3">
                <Link href="/api-reference">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-api-reference">
                    <span>Read the API reference</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/keys">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-generate-keys">
                    <span>Generate your API keys</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-between" data-testid="link-dashboard">
                    <span>View the dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
