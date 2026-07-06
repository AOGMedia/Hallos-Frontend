"use client";

import { AnimatePresence,motion } from "framer-motion";


export default function Template({ children }: { children: React.ReactNode }) {

    return(
    <AnimatePresence mode="wait">
      <motion.div
        // key={title}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        
      >
        {children}
      </motion.div>
    </AnimatePresence>
    )
} 