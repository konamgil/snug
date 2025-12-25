interface BubbleTailIconProps {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}

export function BubbleTailIcon({
  className,
  color = '#FF8200',
  width = 24,
  height = 14,
}: BubbleTailIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 14L0 0H24L12 14Z" fill="white" />
      <path d="M0 0L12 14L24 0" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}
