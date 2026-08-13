export function formatUsdc(n: number): string {
  if (!Number.isFinite(n)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatToken(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }
  if (abs >= 1) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4,
  }).format(n);
}

export function formatUsdcUsd(n: number): string {
  return `$${formatUsdc(n)}`;
}
