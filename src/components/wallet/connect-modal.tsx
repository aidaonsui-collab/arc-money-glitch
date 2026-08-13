import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import {
  WALLETS,
  isWalletInstalled,
  useWallet,
  type WalletId,
} from "@/lib/wallet";
import { MetaMaskIcon, RabbyIcon } from "@/components/wallet/icons";
import { Button } from "@/components/ui/button";

function WalletGlyph({ id }: { id: WalletId }) {
  if (id === "rabby") return <RabbyIcon className="size-8" />;
  return <MetaMaskIcon className="size-8" />;
}

export function ConnectModal() {
  const modalOpen = useWallet((s) => s.modalOpen);
  const closeModal = useWallet((s) => s.closeModal);
  const connect = useWallet((s) => s.connect);
  const connecting = useWallet((s) => s.connecting);
  const error = useWallet((s) => s.error);
  const walletId = useWallet((s) => s.walletId);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-bg/70"
        aria-label="Close connect wallet"
        onClick={closeModal}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="connect-title"
              className="font-display text-lg font-semibold tracking-tight"
            >
              Connect wallet
            </h2>
            <p className="mt-1 text-sm text-muted">
              Rabby or MetaMask. $AMG rewards live on Arc (chain 5042).
            </p>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
            onClick={closeModal}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {WALLETS.map((w) => {
            const installed = isWalletInstalled(w.id);
            const busy = connecting && walletId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                disabled={connecting}
                onClick={() => {
                  if (installed) void connect(w.id);
                  else window.open(w.install, "_blank", "noopener,noreferrer");
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-lg bg-bg px-3.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 hover:shadow-[var(--shadow-border-hover)] disabled:opacity-60"
              >
                <WalletGlyph id={w.id} />
                <span className="flex-1 font-medium">{w.name}</span>
                <span className="text-xs text-muted">
                  {busy ? "Connecting…" : installed ? "Detected" : "Install"}
                </span>
                {!installed ? <ExternalLink className="size-3.5 text-faint" /> : null}
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-4 text-sm text-muted" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full"
          onClick={closeModal}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
