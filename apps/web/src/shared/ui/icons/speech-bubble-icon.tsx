interface SpeechBubbleIconProps {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}

export function SpeechBubbleIcon({
  className,
  color = '#FF8200',
  width = 20,
  height = 25,
}: SpeechBubbleIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.938 3.74098C15.9917 1.18444 13.1349 0.179289 10.431 0.0206368C7.21447 -0.166765 3.99173 0.90547 1.75504 3.922C0.393798 5.75874 0.0640827 7.73072 0 10.0573C0 16.3022 5.43256 18.7033 8.99121 18.9471C10.5209 19.0515 10.801 18.9386 11.5742 18.8758C11.5742 18.8758 10.1075 20.0492 8.85995 20.9415C8.40103 21.2694 7.95659 21.8188 8.42171 22.6132C8.72041 23.1232 9.36744 24.1092 9.68372 24.6075C10.0062 25.1165 10.8351 25.1782 11.5463 24.5117C13.4884 22.6898 14.616 21.4707 16.0641 19.7521C17.6879 17.827 18.9871 15.9711 19.7209 12.5009C20.2295 10.0967 20.2625 6.79371 17.939 3.74098H17.938Z"
        fill={color}
      />
    </svg>
  );
}
