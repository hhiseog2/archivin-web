import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { AccountForm } from './AccountForm';

export const metadata: Metadata = { title: 'Account details' };

export default function AccountPage() {
  return (
    <SiteChrome fullWidth>
      <AccountForm />
    </SiteChrome>
  );
}
