import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/hero";
import { SiteNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/social";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="relative min-h-svh bg-bg text-fg">
      <SiteNav />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
