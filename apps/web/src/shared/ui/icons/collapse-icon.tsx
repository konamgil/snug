interface CollapseIconProps {
  className?: string;
}

export function CollapseIcon({ className }: CollapseIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 4L5 8L10 12V4Z" fill="currentColor" />
    </svg>
  );
}
