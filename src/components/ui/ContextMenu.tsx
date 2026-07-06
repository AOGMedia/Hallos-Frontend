'use client';

import { type ReactNode } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface ContextMenuItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  trigger: ReactNode;
  items: ContextMenuItem[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function ContextMenu({ trigger, items, align = 'end', side = 'bottom' }: ContextMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={8}
        className="w-52 p-2 rounded-2xl border-0 shadow-2xl"
        style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: item.destructive ? '#ef4444' : 'rgba(229,229,229,0.75)' }}
          >
            <span style={{ color: item.destructive ? '#ef4444' : 'rgba(229,229,229,0.50)' }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
