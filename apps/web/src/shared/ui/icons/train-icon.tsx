interface TrainIconProps {
  className?: string;
}

export function TrainIcon({ className }: TrainIconProps) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M7.33333 16.5L5.5 19.25H7.33333L8.25 17.4167H13.75L14.6667 19.25H16.5L14.6667 16.5M5.5 13.75H16.5V11H5.5M5.5 8.25H16.5V5.5H5.5M7.33333 2.75C5.04167 2.75 3.66667 4.125 3.66667 6.41667V13.75C3.66667 15.125 4.58333 16.5 6.41667 16.5H15.5833C17.4167 16.5 18.3333 15.125 18.3333 13.75V6.41667C18.3333 4.125 16.9583 2.75 14.6667 2.75H7.33333Z"
        fill="currentColor"
      />
    </svg>
  );
}
