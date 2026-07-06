'use client';

import { motion } from 'framer-motion';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';

interface GamerButtonProps {
  label: string;
  variant?: 'outline' | 'solid';
  onClick?: () => void;
  href?: string;
}

export function GamerButton({ label, variant = 'outline', onClick, href }: GamerButtonProps) {
  const base =
    'inline-flex items-center gap-2 px-6 py-4 rounded-full font-bold text-base cursor-pointer transition-all duration-200 select-none';

  const styles =
    variant === 'solid'
      ? `${base} bg-primary text-white hover:bg-primary/90`
      : `${base} border border-white/20 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.30)] bg-primary/5 text-[rgba(229,229,229,0.95)] hover:bg-white/5`;

  const content = (
    <>
      <span>{label}</span>
      <ArrowRightIcon width={18} height={14} color="currentColor" />
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={styles}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={styles}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {content}
    </motion.button>
  );
}
