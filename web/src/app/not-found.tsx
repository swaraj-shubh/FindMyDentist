import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FmdMark } from "@/components/shared/brand";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <FmdMark className="size-10" />
      <SearchX className="size-6 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">We couldn't find that page</h1>
      <p className="max-w-sm text-muted-foreground">The link may be old, or the item may have been removed.</p>
      <Button asChild>
        <Link href="/home">Back to FMD</Link>
      </Button>
    </main>
  );
}
