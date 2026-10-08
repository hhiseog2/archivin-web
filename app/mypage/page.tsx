import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { MyPageView } from './MyPageView';

export const metadata: Metadata = { title: 'My page' };

export default function MyPage() {
  return (
    <SiteChrome fullWidth>
      <MyPageView />
    </SiteChrome>
  );
}
