interface MinusIconProps {
  className?: string;
}

export function MinusIcon({ className }: MinusIconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M3.5 7.875V6.125H10.5V7.875H3.5Z" fill="currentColor" />
    </svg>
  );
}
