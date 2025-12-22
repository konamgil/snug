import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

export default function NotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-5 py-12">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/images/logo/logo-oops.svg"
              alt="Oops, Snug"
              width={320}
              height={80}
              priority
            />
          </div>

          {/* Message */}
          <p className="text-lg md:text-xl font-bold text-[hsl(var(--snug-text-primary))] text-center leading-relaxed mb-3">
            It looks like you&apos;re a bit lost.
            <br />
            Let&apos;s go back home.
          </p>

          {/* Error Code */}
          <p className="text-sm text-[hsl(var(--snug-gray))] mb-6">Error code: 404</p>

          {/* Back to Home Button */}
          <Link
            href="/"
            className="px-8 py-3 bg-[hsl(var(--snug-orange))] text-white text-sm font-medium rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Back to Home
          </Link>

          {/* Illustration */}
          <div className="mt-10 w-full max-w-[400px] md:max-w-[500px]">
            <Image
              src="/images/banner/banner-illustration-oops.webp"
              alt="Person relaxing on sofa"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
      </body>
    </html>
  );
}
