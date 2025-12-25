interface WeChatPayIconProps {
  className?: string;
}

export function WeChatPayIcon({ className }: WeChatPayIconProps) {
  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="26" height="26" rx="4" fill="#07C160" />
        <path
          d="M10.5 7C7.5 7 5 9.1 5 11.7C5 13.2 5.9 14.5 7.3 15.3L6.8 17L9 15.7C9.6 15.8 10.1 15.9 10.7 15.9C10.8 15.9 10.9 15.9 11 15.9C10.8 15.4 10.7 14.9 10.7 14.4C10.7 11.7 13.2 9.5 16.3 9.5C16.5 9.5 16.7 9.5 16.9 9.5C16.3 8 13.7 7 10.5 7Z"
          fill="white"
        />
        <path
          d="M8 10.5C8 11.1 7.5 11.5 7 11.5C6.5 11.5 6 11.1 6 10.5C6 9.9 6.5 9.5 7 9.5C7.5 9.5 8 9.9 8 10.5Z"
          fill="#07C160"
        />
        <path
          d="M13 10.5C13 11.1 12.5 11.5 12 11.5C11.5 11.5 11 11.1 11 10.5C11 9.9 11.5 9.5 12 9.5C12.5 9.5 13 9.9 13 10.5Z"
          fill="#07C160"
        />
        <path
          d="M16 11C13.5 11 11.5 12.8 11.5 15C11.5 17.2 13.5 19 16 19C16.5 19 17 18.9 17.5 18.7L19.3 19.7L18.9 18C20.1 17.3 21 16.2 21 15C21 12.8 18.8 11 16 11Z"
          fill="white"
        />
        <path
          d="M14 14C14 14.4 13.6 14.7 13.2 14.7C12.8 14.7 12.4 14.4 12.4 14C12.4 13.6 12.8 13.3 13.2 13.3C13.6 13.3 14 13.6 14 14Z"
          fill="#07C160"
        />
        <path
          d="M19 14C19 14.4 18.6 14.7 18.2 14.7C17.8 14.7 17.4 14.4 17.4 14C17.4 13.6 17.8 13.3 18.2 13.3C18.6 13.3 19 13.6 19 14Z"
          fill="#07C160"
        />
      </svg>
    </div>
  );
}
