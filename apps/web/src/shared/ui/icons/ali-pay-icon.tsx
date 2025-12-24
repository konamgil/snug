interface AliPayIconProps {
  className?: string;
}

export function AliPayIcon({ className }: AliPayIconProps) {
  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="39" height="25" rx="3.5" fill="white" stroke="#E5E5E5" />
        <rect x="6" y="5" width="28" height="16" rx="2" fill="#1677FF" />
        <path
          d="M25 14.2C23.8 13.7 22.4 13.1 21 12.5C21.6 11.3 22.1 10 22.3 8.5H18.5V7.5H23V6.6H18.5V5H17V6.6H12.5V7.5H17V8.5H13.5V9.4H20.9C20.7 10.4 20.3 11.4 19.9 12.2C18.6 11.7 17.3 11.4 16.2 11.3C14.6 11.1 13.2 11.6 12.8 12.7C12.5 13.9 13.2 15.2 15.1 15.6C16.8 16 18.6 15.5 20.2 14.5C21.4 15.1 22.7 15.6 23.9 16L25 14.2Z"
          fill="white"
        />
        <path
          d="M14.9 14.2C14.7 13.7 15.2 13.1 16.1 13C16.9 12.9 17.9 13.2 19 13.6C18 14.3 16.7 14.7 15.5 14.6C15.1 14.5 14.9 14.4 14.9 14.2Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
