"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function AlertModal({
  isOpen,
  onClose,
  message,
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="bg-[#1F2636] rounded-xl p-4 w-auto min-w-[300px] max-w-sm flex items-center gap-4 shadow-2xl border border-white/10 pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
          </motion.div>
          
          <div className="flex-1 text-left">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-semibold text-white"
            >
              Attention Needed
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-xs"
            >
              {message}
            </motion.p>
          </div>
          
          <motion.div
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5 }}
          >
            <Button variant="secondary" onClick={onClose} className="h-8 text-xs px-3">
              OK
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
