import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';

/**
 * 404 ve hata ekranlarının ortak iskeleti.
 *
 * Kapanış bölümüyle aynı dil: hafif teknik çizim ızgarası, mono kod etiketi,
 * display başlık. Hook kullanmaz — hem sunucu bileşeni olan `not-found` hem
 * istemci bileşeni olan `error` aynı işaretlemeyi paylaşır.
 */
export function StatusScreen({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  /** Eylemler — düğme veya link. */
  children: ReactNode;
}) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative flex min-h-[100svh] items-center overflow-hidden outline-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 blueprint-grid opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg)_72%)]"
      />

      <Container className="relative pt-28 pb-20">
        <p className="font-mono text-label text-accent">{code}</p>
        <h1 className="mt-6 max-w-[18ch] text-display-2">{title}</h1>
        <p className="mt-6 max-w-[46ch] text-body-lg text-fg-muted">{description}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">{children}</div>
      </Container>
    </main>
  );
}
