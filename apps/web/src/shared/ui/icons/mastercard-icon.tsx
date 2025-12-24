interface MastercardIconProps {
  className?: string;
}

export function MastercardIcon({ className }: MastercardIconProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="39" height="25" rx="3.5" fill="white" stroke="#E5E5E5" />
        <circle cx="16" cy="13" r="8" fill="#EB001B" />
        <circle cx="24" cy="13" r="8" fill="#F79E1B" />
        <path
          d="M20 6.56C21.78 8.02 22.9 10.35 22.9 13C22.9 15.65 21.78 17.98 20 19.44C18.22 17.98 17.1 15.65 17.1 13C17.1 10.35 18.22 8.02 20 6.56Z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  );
}
