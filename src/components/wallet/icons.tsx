export function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path fill="#E2761B" d="M27.3 4.8 18.2 11.6l1.7-4z" />
      <path fill="#E4761B" d="m4.7 4.8 9 6.9-1.6-4.1z" />
      <path fill="#E4761B" d="m23.5 21.3-2.4 3.7 5.2 1.4 1.5-5z" />
      <path fill="#E4761B" d="m4.3 21.4 1.5 5 5.1-1.4-2.4-3.7z" />
      <path fill="#E4761B" d="m10.6 14.4-1.5 2.2 5.2.2-.2-5.6z" />
      <path fill="#E4761B" d="m21.4 14.4-.4-3.3-.1 5.6 5.2-.2z" />
      <path fill="#D7C1B3" d="m15.9 24.1-2.5-.6.2 2.4z" />
      <path fill="#D7C1B3" d="m16.1 24.1 2.4 1.8.1-2.4z" />
    </svg>
  );
}

export function RabbyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#7084FF" />
      <ellipse cx="16" cy="18" rx="8" ry="7" fill="#fff" />
      <circle cx="13" cy="17.5" r="1.6" fill="#1a1a2e" />
      <circle cx="19" cy="17.5" r="1.6" fill="#1a1a2e" />
      <path
        d="M11 13.2c1.4-1.6 3.1-2.4 5-2.4s3.6.8 5 2.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
