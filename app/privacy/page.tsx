import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { PolicyView } from '../terms/PolicyView';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function PrivacyPage() {
  return (
    <SiteChrome fullWidth>
      <PolicyView doc="privacy" />
    </SiteChrome>
  );
}
