"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "./Button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1F2636] rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl border border-white/10"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 mb-8">{description}</p>
          
          <div className="flex flex-col gap-3 w-full">
            <Button variant="primary" onClick={onAction} className="w-full">
              {actionLabel}
            </Button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm py-2"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
