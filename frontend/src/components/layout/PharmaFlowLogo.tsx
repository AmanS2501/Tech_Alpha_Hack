import type { SVGProps } from 'react';

export function PharmaFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="PharmaFlow Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="10" height="30" y="10" x="5" rx="2" ry="2" fill="url(#logoGradient)" />
      <rect width="10" height="20" y="15" x="20" rx="2" ry="2" fill="url(#logoGradient)" />
      <rect width="10" height="35" y="7.5" x="35" rx="2" ry="2" fill="url(#logoGradient)" />
      <text
        x="55"
        y="32"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        Pharma
      </text>
      <text
        x="125" // Adjusted x for "Flow"
        y="32"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="300" // Lighter weight for "Flow"
        fill="hsl(var(--accent))"
      >
        Flow
      </text>
    </svg>
  );
}
