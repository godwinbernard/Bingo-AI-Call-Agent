import Link from 'next/link';
import { hasClerkKeys } from '@/lib/clerkConfig';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  if (!hasClerkKeys) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Local dev mode</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Clerk is disabled locally</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Add your Clerk keys to `.env.local` to render the production sign-up flow.
            Until then, this route stays available so the app does not crash.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/dashboard" className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
              Continue to dashboard
            </Link>
            <Link href="/" className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/80">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
