import { Metadata } from 'next';
import EbookBuilderClient from './EbookBuilderClient';

export const metadata: Metadata = {
  title: 'Ebook Prompt Builder | Ruang Ngonten',
  description: 'Riset ide brilian, rakit kerangka, dan cetak master prompt Ebook',
};

export default function EbookBuilderPage() {
  return <EbookBuilderClient />;
}
