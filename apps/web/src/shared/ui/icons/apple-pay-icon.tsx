interface ApplePayIconProps {
  className?: string;
}

export function ApplePayIcon({ className }: ApplePayIconProps) {
  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="26" height="26" rx="4" fill="black" />
        <path
          d="M8.8 7.5C8.6 7.8 8.2 8 7.8 8C7.7 7.6 7.9 7.2 8.2 6.9C8.4 6.6 8.8 6.4 9.2 6.4C9.3 6.8 9.1 7.2 8.8 7.5Z"
          fill="white"
        />
        <path
          d="M9.2 8.1C8.6 8.1 8.1 8.4 7.8 8.4C7.5 8.4 7.1 8.1 6.6 8.1C5.9 8.1 5.2 8.6 4.8 9.3C4 10.7 4.6 12.8 5.4 13.9C5.8 14.5 6.3 15.1 6.9 15.1C7.4 15.1 7.6 14.8 8.2 14.8C8.8 14.8 9 15.1 9.5 15.1C10.1 15.1 10.6 14.5 11 13.9C11.4 13.3 11.6 12.7 11.6 12.7C11.6 12.7 10.6 12.3 10.6 11.2C10.6 10.2 11.4 9.8 11.4 9.8C11.4 9.8 10.9 8.9 9.8 8.9C9.3 8.1 9 8.1 9.2 8.1Z"
          fill="white"
        />
        <text
          x="14.5"
          y="13"
          fill="white"
          fontSize="6"
          fontFamily="SF Pro Display, -apple-system, sans-serif"
          fontWeight="500"
        >
          Pay
        </text>
      </svg>
    </div>
  );
}
