import {
  CreateTimesheetForm,
  HoursThisMonthCard,
  EarningsThisMonthCard,
  RecentActivityCard,
} from './components';
import { Receipt, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Manage your timesheets and invoices from here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HoursThisMonthCard />
        <EarningsThisMonthCard />
        <StatCard
          icon={Receipt}
          label="Pending Invoices"
          value="3"
          subtext="$12,450 total"
        />
        <StatCard
          icon={Users}
          label="Active Clients"
          value="8"
          trend="+2"
          trendUp
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateTimesheetForm />
        <RecentActivityCard />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
}) {
  return (
    <div className="glass rounded-xl p-5 hover-lift group">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{subtext}</p>
        )}
      </div>
    </div>
  );
}

