import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { CoinRain } from "@/components/coin-rain";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c6.1 0 8.5-4.3 8.5-6.5 0-.4 0-.8-.1-1.1H12z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-fg" aria-hidden>
      <path d="M14.7 10.3 22.2 2h-1.8l-6.5 7.2L8.7 2H2.2l8 11.3L2.2 22h1.8l7-7.8 5.6 7.8h6.5l-8.4-11.7Zm-2.5 2.7-.8-1.1L4.8 3.3h2.8l5.2 7.2.8 1.1 6.9 9.5h-2.8l-5.5-7.6Z" />
    </svg>
  );
}

function Login() {
  return (
    <div className="relative min-h-svh bg-bg text-fg">
      <CoinRain />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--color-bg)_78%)]" />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-16">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5">
          <img
            src="/images/amg-mark.png"
            alt=""
            className="size-9 object-contain"
            width={36}
            height={36}
          />
          <span className="font-brand text-sm tracking-[0.28em]">AMG</span>
        </Link>

        <div className="rounded-2xl bg-surface/90 p-6 shadow-[var(--shadow-border)] backdrop-blur-sm sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Sign in to your treasury
          </h1>
          <p className="mt-2 text-sm text-muted">
            Same account for sandbox and production. Use the identity your team
            already trusts.
          </p>

          <div className="mt-8 space-y-3">
            {authEnabled ? (
              GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full min-h-12"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  {p.label === "Google" ? <GoogleMark /> : <XMark />}
                  Continue with {p.label}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted">Sign-in is disabled.</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-faint">
          <Link to="/" className="hover:text-muted">
            Back to AMG
          </Link>
        </p>
      </div>
    </div>
  );
}
