import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type AnimatedProp = {
  children: React.ReactNode;
};

export const AnimatedHeader = memo(function AnimatedHeader({
  children,
}: AnimatedProp) {
  return (
    <AnimatePresence mode="wait">
      <motion.h2
        // key={title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="text-[32px] font-medium text-text-primary flex text-center items-center"
      >
        {children}
      </motion.h2>
    </AnimatePresence>
  );
});
