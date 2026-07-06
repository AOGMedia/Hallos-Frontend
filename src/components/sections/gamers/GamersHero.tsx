'use client';

import { motion, type Variants } from 'framer-motion';

const TITLE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const SUBTITLE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.15 } },
};

export function GamersHero() {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center px-4">
      <motion.h2
        className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-tight lg:leading-[80px] text-text-primary"
        variants={TITLE_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        Hallos Hub for{' '}
        <span className="text-accent-cyan">Gamers</span>
      </motion.h2>
      <motion.p
        className="text-base font-medium text-text-muted max-w-[950px]"
        variants={SUBTITLE_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        Play knowledge-based games, challenge other learners, join tournaments, and win real rewards while you learn.
      </motion.p>
    </div>
  );
}
