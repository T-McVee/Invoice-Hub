export const metadata = {
  title: 'Offline - InVoice Hub',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold text-foreground">You&apos;re offline</h1>
        <p className="text-muted-foreground max-w-sm">
          InVoice Hub needs an internet connection to load. Please check your connection and try
          again.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retry
        </a>
      </div>
    </div>
  );
}
