'use client';

import Image from 'next/image';
import { Swords, Timer, ChevronDown, Zap, History, PlusCircle } from 'lucide-react';
import { useGamersStore } from '@/store/gamersStore';

const TOURNAMENTS = [
  { name: 'Science Sprints', format: 'Speed Run', formatColor: '#ff0000', entry: '100 MP', prize: '10,000 MP', quota: '84/100', action: 'Register' },
  { name: 'General Knowledge', format: 'Classic', formatColor: '#ffa500', entry: '200 MP', prize: '12,000 MP', quota: '758/1000', action: 'Register' },
  { name: 'Geography', format: 'Speed Run', formatColor: '#ff0000', entry: '100 MP', prize: '15,000 MP', quota: '43/100', action: 'Register' },
];

const FORMAT_FILTERS = ['All Formats', 'Battle Royale', 'Speed Run', 'Knockout', 'Classic'] as const;

export function TournamentMockup() {
  const { activeFormat, setActiveFormat } = useGamersStore();

  return (
    <div
      className="rounded-[23px] overflow-hidden flex flex-col"
      style={{ background: '#18181a' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div>
          <h4 className="text-[12px] font-semibold text-white">Tournament Arena</h4>
          <p className="text-[6px] text-[#888c94] mt-0.5">Compete for Morgan points (MP) and exchange your winnings for real rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-[6px] text-white"
            style={{ background: 'rgba(128,128,128,0.30)', border: '0.38px solid #808080' }}
          >
            <History size={7} />
            My History
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded text-[6px] text-white"
            style={{ background: '#6a57e5' }}
          >
            <PlusCircle size={7} />
            Host Tournament
          </button>
        </div>
      </div>

      {/* Featured event banner */}
      <div
        className="mx-3 mb-3 rounded-lg p-3 flex items-start gap-3"
        style={{ background: 'linear-gradient(270deg, rgba(17,17,17,0.75) 100%, rgba(17,17,17,1) 62.02%)' }}
      >
        <Image src="/images/trophy-purple.png" alt="Trophy" width={38} height={38} className="object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[4px] font-bold text-black px-1 py-0.5 rounded" style={{ background: '#eab308' }}>FEATURED EVENT</span>
            <span className="text-[4px] font-bold text-red-400">LIVE IN 2H 14MIN</span>
          </div>
          <p className="text-[10px] font-semibold text-white leading-tight">Lagos State Math Championship</p>
          <p className="text-[6px] text-[#888c94] mt-0.5 leading-tight line-clamp-2">The biggest event of the week. 100 players enter, one survives.</p>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-[4px] text-[#888c94]">PRIZE POOL</p>
              <div className="flex items-center gap-0.5">
                <Zap size={5} className="text-yellow-300 fill-yellow-300" />
                <span className="text-[7px] font-medium text-yellow-300">50,000 MP</span>
              </div>
            </div>
            <div>
              <p className="text-[4px] text-[#888c94]">ENTRY FEE</p>
              <span className="text-[7px] font-medium text-white">500 MP</span>
            </div>
            <div>
              <p className="text-[4px] text-[#888c94]">FORMAT</p>
              <span className="text-[7px] font-medium text-white">Battle Royale</span>
            </div>
          </div>
        </div>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded text-[6px] font-semibold text-white shrink-0"
          style={{ background: '#6a57e5' }}
        >
          Join Now →
        </button>
      </div>

      {/* Format filters */}
      <div className="flex items-center gap-1.5 px-3 pb-2 flex-wrap">
        {FORMAT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFormat(f)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[6px] font-medium transition-colors"
            style={{
              background: activeFormat === f ? '#6a57e5' : 'rgba(128,128,128,0.40)',
              border: '0.38px solid #808080',
              color: '#fff',
            }}
          >
            {f === 'Battle Royale' && <Swords size={5} />}
            {f === 'Speed Run' && <Timer size={5} />}
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-[6px] text-white">
          <span>Sort by:</span>
          <button className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'rgba(128,128,128,0.40)', border: '0.38px solid #808080' }}>
            Starting Soon <ChevronDown size={5} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-3 mb-3 rounded-lg overflow-hidden" style={{ background: '#111' }}>
        <div className="grid grid-cols-6 px-3 py-1.5" style={{ background: 'rgba(128,128,128,0.20)' }}>
          {['TOURNAMENT NAME', 'FORMAT', 'ENTRY', 'PRIZE POOL', 'QUOTA', 'ACTION'].map((h) => (
            <span key={h} className="text-[5px] text-white font-medium">{h}</span>
          ))}
        </div>
        {TOURNAMENTS.map(({ name, format, formatColor, entry, prize, quota, action }, i) => (
          <div key={i} className="grid grid-cols-6 items-center px-3 py-2 border-t border-white/10">
            <span className="text-[6px] text-white font-medium">{name}</span>
            <span className="text-[5px] font-medium" style={{ color: formatColor }}>{format}</span>
            <span className="text-[6px] text-white">{entry}</span>
            <div className="flex items-center gap-0.5">
              <Zap size={5} className="text-yellow-300 fill-yellow-300" />
              <span className="text-[6px] text-yellow-300">{prize}</span>
            </div>
            <span className="text-[6px] text-white">{quota}</span>
            <button
              className="px-1.5 py-0.5 rounded text-[5px] font-medium text-white w-fit"
              style={{ background: '#6a57e5' }}
            >
              {action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
