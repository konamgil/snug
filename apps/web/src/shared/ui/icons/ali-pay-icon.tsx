interface AliPayIconProps {
  className?: string;
}

export function AliPayIcon({ className }: AliPayIconProps) {
  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <rect width="26" height="26" rx="4" fill="#1677FF" />
        <g transform="translate(3, 3)">
          <path
            d="M17.5 12.8C15.8 12.1 13.9 11.3 12 10.5C12.8 8.9 13.4 7.1 13.7 5.2H8.5V3.8H14.5V2.5H8.5V0H6.5V2.5H0.5V3.8H6.5V5.2H1.5V6.5H11.3C11 7.8 10.5 9.2 9.8 10.2C8 9.5 6.3 9.1 4.8 8.9C2.6 8.6 0.8 9.3 0.3 10.8C-0.2 12.5 0.8 14.3 3.4 14.9C5.7 15.4 8.1 14.7 10.3 13.3C11.9 14.1 13.7 14.9 15.3 15.5L17.5 12.8Z"
            fill="white"
          />
          <path
            d="M3.2 13.1C2.9 12.4 3.6 11.6 4.8 11.4C6 11.2 7.3 11.6 8.8 12.2C7.4 13.2 5.6 13.8 4 13.6C3.5 13.5 3.2 13.3 3.2 13.1Z"
            fill="white"
          />
        </g>
      </svg>
    </div>
  );
}
