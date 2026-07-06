import { memo, useMemo } from 'react';
import WalletBalanceIcon from '@/components/icons/WalletBalanceIcon';
// import CardIcon from '@/components/icons/CardIcon';
import type { WalletTabProps } from './types';
import { GlowTabs, TabOption } from '@/components/ui/GlowTabs';

export const WalletTabs = memo(function WalletTabs({ activeTab, onTabChange }: WalletTabProps) {
  const tabs: TabOption[] = useMemo(() => [
    {
      id: 'balance',
      label: 'Wallet Balance',
      icon: <WalletBalanceIcon width={21} height={20} className="text-text-primary" />
    },
    // {
    //   id: 'monetization',
    //   label: 'Monetization',
    //   icon: <CardIcon width={22} height={18} className="text-text-primary" />
    // }
  ], []);

  return (
    <GlowTabs 
      tabs={tabs}
      activeTabId={activeTab}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(id) => onTabChange(id as any)}
    />
  );
});