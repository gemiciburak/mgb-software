import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Yatay yerleşim kabı. Kenar boşluğu `--spacing-gutter` token'ından gelir
 * (mobilde 20px, masaüstünde 96px) — bileşenler kendi padding'ini uydurmaz.
 *
 * `as` bilinçli olarak dar tutuldu: geniş `ElementType` birleşimi children
 * tipini `never`e düşürüyor ve polimorfizm faydasından çok sorun üretiyor.
 */
type ContainerTag = 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav' | 'article';

export function Container({
  as: Tag = 'div',
  width = 'content',
  className,
  children,
}: {
  as?: ContainerTag;
  /** content: 1280px okuma kolonu · wide: 1440px dış konteyner */
  width?: 'content' | 'wide';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-gutter',
        width === 'content' ? 'max-w-content' : 'max-w-wide',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
