import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Invoice Hub</CardTitle>
          <CardDescription className="text-base">
            Automate timesheet and invoice generation from Toggl Track
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">Admin Portal</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/portal">Client Portal</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
