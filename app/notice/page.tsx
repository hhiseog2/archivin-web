import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { NoticeList } from './NoticeList';

export const metadata: Metadata = { title: 'Notice' };

export default function NoticePage() {
  return (
    <SiteChrome>
      <NoticeList />
    </SiteChrome>
  );
}
