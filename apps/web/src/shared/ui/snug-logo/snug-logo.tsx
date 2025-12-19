import Image from 'next/image';

interface SnugLogoProps {
  className?: string;
}

export function SnugLogo({ className }: SnugLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`}>
      <Image
        src="/images/logo/logo_hellosnug.svg"
        alt="hello.snug."
        width={173}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </div>
  );
}
