interface ArrowProps {
  size?: number;
  className?: string;
}

export default function Arrow({ size = 26, className }: ArrowProps) {
  return (
    <svg
      className={className}
      width={size}
      height={(size * 10) / 26}
      viewBox="0 0 26 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 5h24M20 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
