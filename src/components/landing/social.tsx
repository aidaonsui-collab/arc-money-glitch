import { Link } from "@tanstack/react-router";
import { amgBuyUrl } from "@/lib/amg";

export function Footer() {
  const buy = amgBuyUrl();

  return (
    <footer className="relative z-10 border-t border-border bg-bg/80 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/images/amg-mark.png"
              alt=""
              className="size-7 object-contain"
              width={28}
              height={28}
            />
            <span className="font-brand text-sm tracking-[0.28em]">AMG</span>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link to="/rewards" className="hover:text-fg">
            Rewards dashboard
          </Link>
          <a href={buy} target="_blank" rel="noreferrer" className="hover:text-fg">
            arcfun.co
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-faint">
        © {new Date().getFullYear()} AMG. Not financial advice. USDC is a mark of
        its respective owner.
      </p>
    </footer>
  );
}
