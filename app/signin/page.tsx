import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in' };

/** Only same-site paths ("/…", not "//…") come back from ?next=; anything else goes to my page (README 8-6). */
function safeNext(next: string | string[] | undefined) {
  const v = Array.isArray(next) ? next[0] : next;
  return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : '/mypage';
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  return (
    <SiteChrome fullWidth>
      <SignInForm next={safeNext(next)} />
    </SiteChrome>
  );
}
