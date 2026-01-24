'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyTokenProps {
  token: string;
}

export function CopyToken({ token }: CopyTokenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}/portal/${token}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = fullUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Your Portal Link:</span>
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 min-w-0 rounded-lg bg-background px-3 py-2 text-sm font-mono border border-border/50 text-primary truncate">
          /portal/{token}
        </code>
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-shrink-0 gap-1.5">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
