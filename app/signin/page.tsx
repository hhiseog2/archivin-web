import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in' };

/** Parked: UI shell only. Authentication is not connected yet. */
export default function SignInPage() {
  return (
    <SiteChrome>
      <SignInForm />
    </SiteChrome>
  );
}
