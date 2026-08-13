import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, LogOut, Waypoints } from "lucide-react";
import { isArcChain } from "@/lib/arc";
import {
  chainLabel,
  shortenAddress,
  switchToArc,
  useWallet,
} from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectModal } from "@/components/wallet/connect-modal";

export function ConnectButton({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const address = useWallet((s) => s.address);
  const chainId = useWallet((s) => s.chainId);
  const openModal = useWallet((s) => s.openModal);
  const disconnect = useWallet((s) => s.disconnect);
  const ready = useWallet((s) => s.ready);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  if (!ready) {
    return <div className="h-10 w-32 animate-pulse rounded-md bg-surface-2" />;
  }

  if (!address) {
    return (
      <Button size={size} className={cn("min-h-11", className)} onClick={openModal}>
        Connect wallet
      </Button>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        size={size}
        className={cn("min-h-11 font-mono", className)}
        onClick={() => setMenu((v) => !v)}
        aria-expanded={menu}
      >
        <span className="size-1.5 rounded-full bg-primary" />
        {shortenAddress(address)}
        <ChevronDown className="size-3.5 text-muted" />
      </Button>
      {menu ? (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-surface p-1.5 shadow-[var(--shadow-border)]">
          <p className="px-2.5 py-2 text-[0.7rem] tracking-wide text-faint uppercase">
            {chainLabel(chainId)}
            {isArcChain(chainId) ? " · live" : ""}
          </p>
          {!isArcChain(chainId) ? (
            <button
              type="button"
              className="flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 text-sm hover:bg-surface-2"
              onClick={async () => {
                try {
                  await switchToArc();
                  setMenu(false);
                } catch {
                  /* wallet surfaces the error */
                }
              }}
            >
              <Waypoints className="size-3.5" />
              Switch to Arc
            </button>
          ) : null}
          <button
            type="button"
            className="flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 text-sm hover:bg-surface-2"
            onClick={async () => {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
          >
            <Copy className="size-3.5" />
            {copied ? "Copied" : "Copy address"}
          </button>
          <button
            type="button"
            className="flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 text-sm hover:bg-surface-2"
            onClick={() => {
              setMenu(false);
              disconnect();
            }}
          >
            <LogOut className="size-3.5" />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function WalletHost() {
  const hydrate = useWallet((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return <ConnectModal />;
}
