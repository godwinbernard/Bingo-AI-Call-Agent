import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { ClerkProvider } from '@clerk/nextjs';
import { hasClerkKeys } from '@/lib/clerkConfig';

export const metadata = {
  title: 'VoiceAgent',
  description: 'VoiceAgent subscription dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body style={{ background: '#0F0F1A', color: '#F1F1F5' }}>
        {hasClerkKeys ? (
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <AppShell>{children}</AppShell>
          </ClerkProvider>
        ) : (
          <AppShell>{children}</AppShell>
        )}
      </body>
    </html>
  );
}
