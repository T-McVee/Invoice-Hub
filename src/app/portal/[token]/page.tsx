import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Client Portal</CardTitle>
            <CardDescription>
              Access your timesheets and invoices here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Token: <code className="rounded bg-muted px-1.5 py-0.5">{token}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
