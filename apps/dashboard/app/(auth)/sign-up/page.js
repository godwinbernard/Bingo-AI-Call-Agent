'use client';

import Link from 'next/link';
import { hasClerkKeys } from '@/lib/clerkConfig';
import { SignUp } from '@clerk/nextjs';
import { Phone, CheckCircle2 } from 'lucide-react';

function BingoLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Phone size={16} color="#fff" strokeWidth={2} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 17, color: '#F1F1F5', letterSpacing: '-0.01em' }}>
        Bingo AI
      </span>
    </div>
  );
}

const INCLUDED = [
  '500 AI call minutes free',
  'Full campaign builder access',
  'Real-time call transcripts',
  'CRM integrations included',
  'No credit card required',
];

function LocalDevCard() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0F0F1A' }}>
      <div
        className="w-full max-w-md p-8 text-center"
        style={{
          background: '#1A1A2E',
          border: '1px solid #2A2A40',
          borderRadius: 20,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex justify-center mb-6">
          <BingoLogo />
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-semibold tracking-wider uppercase"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          Local dev mode
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#F1F1F5' }}>
          Clerk keys not configured
        </h1>
        <p className="text-sm leading-6 mb-7" style={{ color: '#9898B3' }}>
          Add <code style={{ background: '#1E1E35', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: '#818CF8' }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{' '}
          to <code style={{ background: '#1E1E35', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: '#818CF8' }}>.env.local</code> to enable sign-up.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="btn-primary w-full text-center justify-center"
            style={{ borderRadius: 10, padding: '11px 20px', fontSize: 14 }}
          >
            Continue to dashboard
          </Link>
          <Link
            href="/sign-in"
            className="btn-ghost w-full text-center justify-center"
            style={{ borderRadius: 10, padding: '10px 20px', fontSize: 14 }}
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  if (!hasClerkKeys) {
    return <LocalDevCard />;
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0F0F1A' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: '#13132B', borderRight: '1px solid #2A2A40' }}
      >
        <BingoLogo />

        <div>
          <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}>
            Start your free trial today
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#9898B3' }}>
            Set up your first AI call campaign in under 10 minutes. No engineering required.
          </p>

          <div className="space-y-3">
            {INCLUDED.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} style={{ color: '#22C55E', flexShrink: 0 }} strokeWidth={2} />
                <span className="text-sm" style={{ color: '#9898B3' }}>{item}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-10 p-5 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}
          >
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(241,241,245,0.75)' }}>
              &ldquo;We replaced a 12-person SDR team with Bingo AI and our qualified pipeline doubled in 60 days.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}
              >
                M
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#F1F1F5' }}>Marcus T.</p>
                <p className="text-xs" style={{ color: '#5A5A7A' }}>VP Sales, Lendify</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: '#3A3A55' }}>
          © {new Date().getFullYear()} Bingo AI, Inc.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-8">
          <BingoLogo />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: '#9898B3' }}>
              Already have an account?{' '}
              <Link href="/sign-in" style={{ color: '#818CF8', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>

          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/onboarding"
            appearance={{
              variables: {
                colorPrimary: '#6366F1',
                colorBackground: '#1A1A2E',
                colorInputBackground: '#1E1E35',
                colorInputText: '#F1F1F5',
                colorText: '#F1F1F5',
                colorTextSecondary: '#9898B3',
                colorNeutral: '#9898B3',
                borderRadius: '10px',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
              elements: {
                card: {
                  background: 'transparent',
                  boxShadow: 'none',
                  border: 'none',
                  padding: 0,
                },
                headerTitle: { display: 'none' },
                headerSubtitle: { display: 'none' },
                socialButtonsBlockButton: {
                  background: '#1E1E35',
                  border: '1px solid #2A2A40',
                  color: '#F1F1F5',
                },
                formFieldInput: {
                  background: '#1E1E35',
                  border: '1px solid #2A2A40',
                  color: '#F1F1F5',
                },
                formButtonPrimary: {
                  background: '#6366F1',
                  fontWeight: 500,
                },
                footerActionLink: { color: '#818CF8' },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
