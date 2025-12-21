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
        width={216}
        height={40}
        className="h-9 md:h-10 w-auto"
        priority
      />
    </div>
  );
}
