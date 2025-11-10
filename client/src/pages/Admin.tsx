import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Home, Activity, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminStats {
  totalChallenges: number;
  totalAttempts: number;
  successfulVerifications: number;
  failedVerifications: number;
  suspiciousAttempts: number;
  averageScore: number;
  recentAttempts: Array<{
    id: string;
    success: boolean;
    score: number;
    createdAt: string;
    flaggedSuspicious: boolean;
  }>;
}

export default function Admin() {
  const { theme } = useTheme();

  // Fetch admin stats
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const successRate = stats 
    ? ((stats.successfulVerifications / Math.max(stats.totalAttempts, 1)) * 100).toFixed(1)
    : '0.0';

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
                <Button variant="ghost" size="sm" data-testid="link-demo">
                  <Home className="w-4 h-4 mr-2" />
                  Demo
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor InCaptcha performance and security metrics
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Attempts"
                value={stats.totalAttempts}
                icon={<Users className="w-6 h-6" />}
                theme={theme}
              />
              <StatCard
                title="Successful"
                value={stats.successfulVerifications}
                icon={<CheckCircle className="w-6 h-6 text-primary" />}
                theme={theme}
                subtitle={`${successRate}% success rate`}
              />
              <StatCard
                title="Failed"
                value={stats.failedVerifications}
                icon={<XCircle className="w-6 h-6 text-destructive" />}
                theme={theme}
              />
              <StatCard
                title="Suspicious"
                value={stats.suspiciousAttempts}
                icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
                theme={theme}
              />
              <StatCard
                title="Average Score"
                value={`${stats.averageScore.toFixed(1)}%`}
                icon={<Activity className="w-6 h-6 text-primary" />}
                theme={theme}
              />
              <StatCard
                title="Total Challenges"
                value={stats.totalChallenges}
                icon={<Activity className="w-6 h-6" />}
                theme={theme}
              />
            </div>

            {/* Recent Attempts */}
            <Card className={`${
              theme === 'macos' 
                ? 'bg-card/80 backdrop-blur-xl border-card-border shadow-lg' 
                : 'bg-card border-card-border'
            }`}>
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Recent Verification Attempts</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Last {stats.recentAttempts.length} verification attempts
                </p>
              </div>
              
              <div className="divide-y divide-border">
                {stats.recentAttempts.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No verification attempts yet</p>
                  </div>
                ) : (
                  stats.recentAttempts.map((attempt) => (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 flex items-center justify-between hover-elevate"
                      data-testid={`attempt-${attempt.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {attempt.success ? (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {attempt.success ? 'Success' : 'Failed'}
                            </span>
                            {attempt.flaggedSuspicious && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full font-medium">
                                Suspicious
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-semibold text-primary">
                          {attempt.score}%
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No data available</p>
          </Card>
        )}
      </main>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  theme, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  theme: 'macos' | 'discord';
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className={`p-6 hover-elevate transition-all ${
        theme === 'macos' 
          ? 'bg-card/60 backdrop-blur-md border-card-border' 
          : 'bg-card border-card-border'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-primary">{icon}</div>
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
