interface CalendarIconProps {
  className?: string;
}

export function CalendarIcon({ className }: CalendarIconProps) {
  return (
    <svg viewBox="0 0 9 9.75" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M8.25 0.75H6.75V0H6V0.75H3V0H2.25V0.75H0.75C0.3375 0.75 0 1.0875 0 1.5V9C0 9.4125 0.3375 9.75 0.75 9.75H8.25C8.6625 9.75 9 9.4125 9 9V1.5C9 1.0875 8.6625 0.75 8.25 0.75ZM8.25 9H0.75V3.75H8.25V9ZM8.25 3H0.75V1.5H2.25V2.25H3V1.5H6V2.25H6.75V1.5H8.25V3Z"
        fill="currentColor"
      />
    </svg>
  );
}
