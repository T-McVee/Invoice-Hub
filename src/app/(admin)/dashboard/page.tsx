import { CreateTimesheetForm } from './components';
import { TrendingUp, Clock, Receipt, Users } from 'lucide-react';

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
        <StatCard
          icon={Clock}
          label="Hours This Month"
          value="164.5"
          trend="+12%"
          trendUp
        />
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
        <StatCard
          icon={TrendingUp}
          label="Revenue MTD"
          value="$18,240"
          trend="+23%"
          trendUp
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateTimesheetForm />

        {/* Recent Activity Card */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your latest timesheets and invoices
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <ActivityItem
                type="timesheet"
                title="November 2025 Timesheet"
                client="Acme Corp"
                time="2 hours ago"
              />
              <ActivityItem
                type="invoice"
                title="Invoice #INV-2025-042"
                client="TechStart Inc"
                time="Yesterday"
              />
              <ActivityItem
                type="timesheet"
                title="October 2025 Timesheet"
                client="Acme Corp"
                time="3 days ago"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                View all activity in the Analytics section
              </p>
            </div>
          </div>
        </div>
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

function ActivityItem({
  type,
  title,
  client,
  time,
}: {
  type: 'timesheet' | 'invoice';
  title: string;
  client: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          type === 'timesheet' ? 'bg-primary/10' : 'bg-chart-2/10'
        }`}
      >
        {type === 'timesheet' ? (
          <Clock className="h-5 w-5 text-primary" />
        ) : (
          <Receipt className="h-5 w-5 text-chart-2" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <p className="text-sm text-muted-foreground">{client}</p>
      </div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{time}</p>
    </div>
  );
}
