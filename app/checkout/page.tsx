import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { CheckoutView } from './CheckoutView';

export const metadata: Metadata = { title: 'Checkout' };

/** Parked: UI shell only. Payment (PG) and order saving are not connected yet. */
export default function CheckoutPage() {
  return (
    <SiteChrome mobileTopBar={false} mobileHeader={false} mobileFooter={false}>
      <CheckoutView />
    </SiteChrome>
  );
}
