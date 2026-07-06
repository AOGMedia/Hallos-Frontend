"use client";
import { useEffect } from 'react';

export function ScrollRestorationDisabler() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return null;
}