'use client';

import { motion, type Variants } from 'framer-motion';
import { GamerButton } from './GamerButton';
import { MockupCard } from './MockupCard';

interface ButtonConfig {
  label: string;
  variant?: 'outline' | 'solid';
  href?: string;
}

interface FeatureRowProps {
  /** When true, text is on the left and mockup on the right */
  reversed?: boolean;
  heading: string;
  buttons: ButtonConfig[];
  children: React.ReactNode; // mockup content
}

const SLIDE_LEFT: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const SLIDE_RIGHT: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export function FeatureRow({ reversed = false, heading, buttons, children }: FeatureRowProps) {
  const textContent = (
    <motion.div
      className="flex flex-col gap-10 justify-center w-full lg:max-w-[600px]"
      variants={reversed ? SLIDE_LEFT : SLIDE_RIGHT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <p className="text-xl sm:text-2xl font-medium leading-9 text-text-primary">{heading}</p>
      <div className="flex flex-wrap gap-3">
        {buttons.map(({ label, variant, href }) => (
          <GamerButton key={label} label={label} variant={variant} href={href} />
        ))}
      </div>
    </motion.div>
  );

  const mockupContent = (
    <motion.div
      className="w-full"
      variants={reversed ? SLIDE_RIGHT : SLIDE_LEFT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <MockupCard>
        <div className="p-5 sm:p-6">{children}</div>
      </MockupCard>
    </motion.div>
  );

  return (
    <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-6`}>
      {mockupContent}
      {textContent}
    </div>
  );
}
