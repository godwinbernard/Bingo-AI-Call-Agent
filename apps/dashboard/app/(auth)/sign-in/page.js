'use client';

import Link from 'next/link';
import { hasClerkKeys } from '@/lib/clerkConfig';
import { SignIn } from '@clerk/nextjs';
import { Phone } from 'lucide-react';

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
          Add <code style={{ background: '#1E1E35', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: '#818CF8' }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{' '}
          <code style={{ background: '#1E1E35', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: '#818CF8' }}>CLERK_SECRET_KEY</code> to{' '}
          <code style={{ background: '#1E1E35', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: '#818CF8' }}>.env.local</code> to enable authentication.
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
            href="https://bingo.ai"
            target="_blank"
            className="btn-ghost w-full text-center justify-center"
            style={{ borderRadius: 10, padding: '10px 20px', fontSize: 14 }}
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  if (!hasClerkKeys) {
    return <LocalDevCard />;
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0F0F1A' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: '#13132B', borderRight: '1px solid #2A2A40' }}
      >
        <BingoLogo />

        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
                display: 'inline-block',
              }}
            />
            2,400+ companies running AI calls
          </div>

          <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}>
            Your AI sales team is ready to dial
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#9898B3' }}>
            Sign in to manage campaigns, review call transcripts, and track conversion metrics across your outbound pipeline.
          </p>

          <div className="space-y-4">
            {[
              { stat: '47M+', label: 'Calls placed' },
              { stat: '< 500ms', label: 'AI response latency' },
              { stat: '99.97%', label: 'Platform uptime' },
            ].map(({ stat, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#818CF8' }}>✓</span>
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: '#F1F1F5' }}>{stat}</p>
                  <p className="text-xs" style={{ color: '#5A5A7A' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#3A3A55' }}>
          © {new Date().getFullYear()} Bingo AI, Inc.
        </p>
      </div>

      {/* Right panel — sign-in form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <BingoLogo />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}>
              Sign in to your account
            </h1>
            <p className="text-sm" style={{ color: '#9898B3' }}>
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" style={{ color: '#818CF8', fontWeight: 500 }}>
                Start free trial
              </Link>
            </p>
          </div>

          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
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

          <p className="mt-8 text-center text-xs" style={{ color: '#3A3A55' }}>
            Are you an admin?{' '}
            <Link href="/admin/login" style={{ color: '#5A5A7A' }}>
              Admin login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
