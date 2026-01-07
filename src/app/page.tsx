import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  Receipt,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-background" />
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 noise" />

      {/* Hero Gradient Orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Hero Content */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-up">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by Toggl Track</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up stagger-1">
            <span className="text-foreground">Invoice</span>
            <span className="text-gradient">Hub</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up stagger-2">
            Transform your Toggl time entries into beautiful timesheets and invoices.
            Automated, accurate, and effortlessly professional.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
            <Button
              asChild
              size="lg"
              className="group px-8 py-6 text-base rounded-xl hover-lift glow-sm"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Admin Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base rounded-xl glass hover-lift"
            >
              <Link href="/portal">Client Portal</Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl w-full animate-fade-up stagger-4">
          <FeatureCard
            icon={Clock}
            title="Time Tracking"
            description="Seamlessly sync with Toggl Track to capture every billable hour"
          />
          <FeatureCard
            icon={FileSpreadsheet}
            title="Smart Timesheets"
            description="Auto-generate detailed timesheets with project breakdowns"
          />
          <FeatureCard
            icon={Receipt}
            title="Pro Invoices"
            description="Create polished invoices ready to send to clients"
          />
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center gap-8 mt-16 text-muted-foreground animate-fade-up stagger-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm">Secure & Private</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl glass hover-lift cursor-default">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
