import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SearchPageClient from "./SearchPageClient";

function SearchPageFallback() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-deep-bg via-neon-blue/15 to-deep-bg" />
      <div className="fixed inset-0 -z-10 bg-deep-bg/50" />
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-neon-blue/60" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
