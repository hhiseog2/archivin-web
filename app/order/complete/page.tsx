import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { OrderComplete } from './OrderComplete';

export const metadata: Metadata = { title: 'Order placed' };

/** `/order/complete?id=…` — A21_OrderDone / A21_OrderPaid (README 8-8). Header + footer. */
export default async function OrderCompletePage({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  return (
    <SiteChrome fullWidth>
      <OrderComplete id={typeof id === 'string' ? id : ''} />
    </SiteChrome>
  );
}
