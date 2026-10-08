import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Dil farkında navigasyon sarmalayıcıları.
 *
 * Uygulama içinde `next/link` YERİNE buradaki `Link` kullanılır — yollar
 * otomatik olarak aktif dile çevrilir (`/services` → `/hizmetler`).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
