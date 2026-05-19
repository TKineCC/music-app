import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import HomePageClient from "./HomePageClient";

function HomePageFallback() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-deep-bg via-neon-purple/20 to-deep-bg opacity-80" />
      <div className="fixed inset-0 -z-10 bg-deep-bg/50" />
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-neon-blue/60" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageClient />
    </Suspense>
  );
}
