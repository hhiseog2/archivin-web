import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { PayView, type PayState } from './PayView';

/** Private payment links never show in shop, search, sitemaps or `more like this` (README 8-16). */
export const metadata: Metadata = { title: 'Private payment', robots: { index: false, follow: false } };

const STATES: PayState[] = ['open', 'paid', 'expired'];

/** `/pay/[code]` — A21_Pay · A21_DPay. `?state=paid|expired` previews the other states (QA). */
export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ state?: string | string[] }>;
}) {
  const { code } = await params;
  const { state } = await searchParams;
  const preview = STATES.find((s) => s === state);
  return (
    <SiteChrome fullWidth>
      <PayView code={code} preview={preview} />
    </SiteChrome>
  );
}
