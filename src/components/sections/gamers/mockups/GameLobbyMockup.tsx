'use client';

import { Swords, Home, Trophy, Users, BarChart2, LogOut, Search, Bell, Zap } from 'lucide-react';
import Image from 'next/image';

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'Lobby', active: true },
  { icon: Trophy, label: 'Tournament' },
  { icon: Users, label: 'Leaderboard' },
  { icon: BarChart2, label: 'Chuta Wallet' },
  { icon: Zap, label: 'Game Identity' },
];

const PLAYERS = [
  { name: 'MidnightBolt', points: '1300', wins: 15, losses: 2, avatar: '/images/player-avatar-2.png', isAI: false },
  { name: 'FastHacker', points: '1300', wins: 35, losses: 2, avatar: '/images/player-avatar-3.png', isAI: true },
  { name: 'MidnightBolt', points: '1300', wins: 15, losses: 2, avatar: '/images/player-avatar-2.png', isAI: false },
  { name: 'MidnightBolt', points: '1300', wins: 15, losses: 2, avatar: '/images/player-avatar-2.png', isAI: false },
  { name: 'MidnightBolt', points: '1300', wins: 15, losses: 2, avatar: '/images/player-avatar-2.png', isAI: false },
  { name: 'FastHacker', points: '1300', wins: 35, losses: 2, avatar: '/images/player-avatar-3.png', isAI: true },
  { name: 'MidnightBolt', points: '1300', wins: 15, losses: 2, avatar: '/images/player-avatar-2.png', isAI: false },
  { name: 'MidnightBolt', points: '1300', wins: 15, losses: 2, avatar: '/images/player-avatar-2.png', isAI: false },
];

function PlayerCard({ player }: { player: (typeof PLAYERS)[0] }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-2 rounded"
      style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.30), rgba(0,0,0,0.30)), #1f2636',
        border: '0.44px solid rgba(234,234,234,0.15)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <Image
          src={player.avatar}
          alt={player.name}
          width={18}
          height={18}
          className="rounded-full border border-white/30 object-cover"
        />
        <span className="text-[7px] font-medium text-white truncate flex-1">{player.name}</span>
        {player.isAI && (
          <span className="text-[5px] text-primary font-bold">AI</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Zap size={5} className="text-yellow-400" strokeWidth={2} />
        <span className="text-[6px] text-[#888c94]">{player.points} Morgan Points</span>
      </div>
      <div className="flex items-center gap-1">
        <BarChart2 size={5} className="text-[#888c94]" />
        <span className="text-[6px] text-[#888c94]">{player.wins} Wins / {player.losses} Losses</span>
      </div>
      <div className="border-t border-white/10 pt-1 mt-0.5">
        <button
          className="w-full flex items-center justify-center gap-1 py-1 rounded text-[7px] font-bold text-white"
          style={{ background: '#6a57e5' }}
        >
          <Swords size={6} />
          Challenge
        </button>
      </div>
    </div>
  );
}

export function GameLobbyMockup() {
  return (
    <div
      className="rounded-[20px] overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.50), rgba(0,0,0,0.50)), #1f2636' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-white/10"
        style={{ background: 'linear-gradient(0deg, rgba(31,38,54,0.50), rgba(31,38,54,0.50)), #000' }}
      >
        <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 flex-1 max-w-[100px]">
          <Search size={6} className="text-[#888c94]" />
          <span className="text-[6px] text-[#888c94]">Search players</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[5px] text-[#888c94]">13,078 online</span>
          <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5">
            <Zap size={5} className="text-yellow-300" />
            <span className="text-[5px] text-white">23,000 CP</span>
          </div>
          <Bell size={8} className="text-[#888c94]" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[80px] flex-shrink-0 bg-black flex flex-col gap-1 py-3 px-2">
          <div className="mb-2">
            <span className="text-[9px] font-bold text-white">Hallos</span>
          </div>
          {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[6px] font-medium ${
                active ? 'bg-[#1f2636] text-white' : 'text-[#888c94]'
              }`}
            >
              <Icon size={7} />
              {label}
            </div>
          ))}
          <div className="mt-auto pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[6px] text-[#888c94]">
              <LogOut size={7} />
              Exit
            </div>
          </div>
        </div>

        {/* Player grid — 2 cols on mobile, 4 on sm+; y-scrollable */}
        <div className="flex-1 p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 content-start overflow-y-auto max-h-[260px]">
          {PLAYERS.map((player, i) => (
            <PlayerCard key={i} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}
