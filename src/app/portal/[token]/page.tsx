import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, Shield } from 'lucide-react';

interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-background" />
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 noise" />

      <div className="relative z-10 p-8">
        <div className="mx-auto max-w-2xl pt-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Portal</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Client <span className="text-primary">Portal</span>
            </h1>
            <p className="text-muted-foreground">
              Access your timesheets and invoices securely
            </p>
          </div>

          {/* Main Card */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Your Documents
              </CardTitle>
              <CardDescription>
                View and download your timesheets and invoices from here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Access Token:</span>
                </p>
                <code className="mt-2 block rounded-lg bg-background px-3 py-2 text-sm font-mono border border-border/50 text-primary">
                  {token}
                </code>
              </div>
              
              <p className="text-sm text-muted-foreground text-center pt-4">
                Your documents will appear here once they&apos;re ready.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
