interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Client Portal</h1>
        <p className="text-gray-600">
          Access your timesheets and invoices here.
        </p>
        <p className="mt-4 text-sm text-gray-400">Token: {token}</p>
      </div>
    </div>
  );
}

