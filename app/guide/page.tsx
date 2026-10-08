import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { GuideView } from './GuideView';

export const metadata: Metadata = { title: 'Guide' };

export default function GuidePage() {
  return (
    <SiteChrome fullWidth>
      <GuideView />
    </SiteChrome>
  );
}
