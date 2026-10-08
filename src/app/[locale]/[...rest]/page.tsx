import { notFound } from 'next/navigation';

/**
 * Dil segmenti altında eşleşmeyen her yol buraya düşer ve yerelleştirilmiş
 * 404'ü (`[locale]/not-found.tsx`) render eder. Bu dosya olmadan `/olmayan`
 * gibi adresler layout'suz, temasız varsayılan 404'e gidiyordu.
 */
export default function CatchAllPage() {
  notFound();
}
