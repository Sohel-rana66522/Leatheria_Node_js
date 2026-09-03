import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-24 flex flex-col items-center text-center gap-6">
      <h1 className="font-display text-[32px] text-primary">Page not found</h1>
      <p className="text-body-md text-on-surface-variant">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="bg-primary text-on-primary px-8 py-3 uppercase text-[13px] font-semibold tracking-wider">
        Back to Home
      </Link>
    </div>
  );
}
