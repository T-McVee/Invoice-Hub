import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Invoice Hub</h1>
        <p className="mb-8 text-lg text-gray-600">
          Automate timesheet and invoice generation from Toggl Track
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Admin Portal
          </Link>
          <Link
            href="/portal"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50 transition-colors"
          >
            Client Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
