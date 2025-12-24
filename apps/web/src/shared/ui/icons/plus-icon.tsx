interface PlusIconProps {
  className?: string;
}

export function PlusIcon({ className }: PlusIconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M6.125 7.875H3.5V6.125H6.125V3.5H7.875V6.125H10.5V7.875H7.875V10.5H6.125V7.875Z"
        fill="currentColor"
      />
    </svg>
  );
}
