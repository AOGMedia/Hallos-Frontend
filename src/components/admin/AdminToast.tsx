'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function AdminToast() {
  const { toast, hideToast } = useAdminDashboardStore();

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={18} />,
    error: <XCircle className="text-rose-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  };

  return (
    <AnimatePresence>
      {toast.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[300px]"
          style={{ backgroundColor: 'rgba(24, 24, 27, 0.8)' }}
        >
          <div className={`p-2 rounded-xl ${bgColors[toast.type]}`}>
            {icons[toast.type]}
          </div>
          
          <div className="flex-1">
             <p className="text-sm font-medium text-zinc-100">{toast.message}</p>
          </div>

          <button 
            onClick={hideToast}
            className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
