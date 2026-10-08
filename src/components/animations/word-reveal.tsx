'use client';

import { motion } from 'motion/react';
import { Fragment } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { EASE_ENTRANCE } from '@/lib/motion';

interface WordRevealProps {
  /** Tek satırlık metin. Kelimelere boşluktan bölünür. */
  text: string;
  className?: string;
  /** İlk kelimeden önceki gecikme (sn). */
  delay?: number;
  /** Kelimeler arası gecikme (sn). */
  stagger?: number;
}

/**
 * Kelime kelime açılan metin.
 *
 * Her kelime kendi maskesinin altından yukarı kayarak girer — tipografinin
 * kendisi hareket eder, kutular değil. Büyük puntolu cümlelerde kullanılır,
 * gövde metninde değil: okunacak metni geciktirmek kötü bir takas.
 *
 * İki detay önemli:
 *   • Boşluklar sarmalayıcıların DIŞINDA duruyor, yani satır sonları normal
 *     yerlerinden kırılıyor. İçeri alınsaydı cümle tek satırda kalırdı.
 *   • Maskenin altına `pb/-mb` payı eklendi: Türkçede alt uzantılı harf çok
 *     (ç, ğ, ş, y, j) ve `overflow-hidden` onları kırpıyordu.
 *
 * Hareket azaltma açıkken düz metin render edilir — maske de, gecikme de yok.
 */
export function WordReveal({ text, className, delay = 0, stagger = 0.045 }: WordRevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '115%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.72, delay: delay + index * stagger, ease: EASE_ENTRANCE }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
