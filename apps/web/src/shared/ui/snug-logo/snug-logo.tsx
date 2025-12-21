import Image from 'next/image';

interface SnugLogoProps {
  className?: string;
}

export function SnugLogo({ className }: SnugLogoProps) {
  return (
    <Image
      src="/images/logo/logo_hellosnug.svg"
      alt="hello.snug."
      width={173}
      height={32}
      className={className ?? 'h-8 w-auto'}
      priority
    />
  );
}
