import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { PolicyView } from './PolicyView';

export const metadata: Metadata = { title: 'Terms of use' };

export default function TermsPage() {
  return (
    <SiteChrome fullWidth>
      <PolicyView doc="terms" />
    </SiteChrome>
  );
}
