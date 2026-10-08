import type { Metadata } from 'next';
import { SiteChrome } from '@/components/SiteChrome';
import { AddressesForm } from './AddressesForm';

export const metadata: Metadata = { title: 'Addresses' };

export default function AddressesPage() {
  return (
    <SiteChrome fullWidth>
      <AddressesForm />
    </SiteChrome>
  );
}
