import { CreateTimesheetForm } from './components';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your timesheets and invoices
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CreateTimesheetForm />

        {/* Placeholder for future widgets */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Quick Stats
          </h2>
          <p className="text-sm text-muted-foreground">
            Analytics and recent activity will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
