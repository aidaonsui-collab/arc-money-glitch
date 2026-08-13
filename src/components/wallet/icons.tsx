import { cn } from "@/lib/utils";

export function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <img
      src="/images/wallets/metamask.svg"
      alt=""
      width={32}
      height={32}
      draggable={false}
      className={className}
    />
  );
}

export function RabbyIcon({ className }: { className?: string }) {
  return (
    <img
      src="/images/wallets/rabby.png"
      alt=""
      width={32}
      height={32}
      draggable={false}
      className={cn("rounded-full", className)}
    />
  );
}
