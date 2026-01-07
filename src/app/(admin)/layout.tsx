export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Invoice Hub</h1>
          <div className="flex gap-6">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/timesheets" className="text-gray-600 hover:text-gray-900">
              Timesheets
            </a>
            <a href="/invoices" className="text-gray-600 hover:text-gray-900">
              Invoices
            </a>
            <a href="/clients" className="text-gray-600 hover:text-gray-900">
              Clients
            </a>
            <a href="/analytics" className="text-gray-600 hover:text-gray-900">
              Analytics
            </a>
          </div>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}

