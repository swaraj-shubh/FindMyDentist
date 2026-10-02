"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl p-6 pt-24">
      <ErrorState message={error.message || "An unexpected error occurred."} onRetry={reset} />
    </main>
  );
}
