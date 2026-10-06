import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import ui from '@/components/ui.module.css';

export default function NotFound() {
  return (
    <SiteChrome>
      <main style={{ padding: '40px 16px 0', maxWidth: 480 }}>
        <h1 className={ui.pageTitle}>Not found</h1>
        <p className={ui.pageIntro}>This page doesn&apos;t exist, or the piece has gone to the archive.</p>
        <div style={{ marginTop: 24 }}>
          <Link href="/shop" className={ui.btnPrimary}>
            Shop new in
          </Link>
        </div>
      </main>
    </SiteChrome>
  );
}
