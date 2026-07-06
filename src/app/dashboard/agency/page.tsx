import { AgencyTabsClient } from '@/components/agency/AgencyTabsClient';

export default function AgencyPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Agencies</h1>
        <p className="text-zinc-400">Connect with brands and creators</p>
      </div>
      
      <AgencyTabsClient />
    </div>
  );
}