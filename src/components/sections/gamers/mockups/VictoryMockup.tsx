'use client';

import Image from 'next/image';
import { Clock, ChevronUp, Check, X } from 'lucide-react';

const QA_RESULTS = [
  { q: 'Q1:', question: 'What is the capital city of brazil?', correct: true, ans: 'Brasilia', time: '1.3 secs' },
  { q: 'Q2:', question: 'Which country has the most manufacturing exports?', correct: true, ans: 'Brasilia', time: '1.3 secs' },
  { q: 'Q3:', question: 'What is the largest country by GDP?', correct: false, ans: 'Brasilia', time: '1.3 secs' },
  { q: 'Q4:', question: 'Which of these country is a sovereign nation?', correct: true, ans: 'Brasilia', time: '1.3 secs' },
];

export function VictoryMockup() {
  return (
    <div
      className="rounded-[20px] overflow-hidden flex flex-col gap-3 p-4"
      style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.50), rgba(0,0,0,0.50)), #1f2636' }}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <X size={10} className="text-primary" />
        <span className="text-[10px] font-semibold text-white">Friendly Challenge</span>
      </div>

      {/* Glow + VICTORY */}
      <div className="relative flex items-center justify-center py-2">
        <div
          className="absolute w-40 h-20 rounded-full"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, #21c43c 0%, #04ff78 100%)',
            filter: 'blur(40px)',
            opacity: 0.5,
          }}
        />
        <div className="relative flex items-center gap-2">
          <Image src="/images/trophy-gold.png" alt="Trophy" width={21} height={21} className="object-contain" />
          <span className="text-[18px] font-semibold text-yellow-300">VICTORY!</span>
        </div>
      </div>

      {/* Score block */}
      <div
        className="rounded p-3"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.30), rgba(0,0,0,0.30)), #1f2636', border: '0.44px solid rgba(234,234,234,0.1)' }}
      >
        <p className="text-[6px] text-[#888c94] text-center mb-2">Morgan points won</p>
        <div className="flex items-center justify-between gap-2">
          {/* Home player */}
          <div className="flex items-center gap-1.5">
            <Image src="/images/player-avatar-1.png" alt="King_Minkk" width={22} height={22} className="rounded-full border border-white/30 object-cover" />
            <span className="text-[7px] text-white font-medium">Kingsley</span>
          </div>
          {/* Scores */}
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-white">41</span>
            <div className="p-1 rounded" style={{ background: '#6a57e5' }}>
              <X size={6} className="text-white" />
            </div>
            <span className="text-[14px] font-medium text-white">34</span>
          </div>
          {/* Away player */}
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] text-white font-medium">MidnightBolt</span>
            <Image src="/images/player-avatar-2.png" alt="MidnightBolt" width={22} height={22} className="rounded-full border border-white/30 object-cover" />
          </div>
        </div>
      </div>

      {/* Results section */}
      <div>
        {/* Toggle header */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-t"
          style={{ background: '#1f2636' }}
        >
          <span className="text-[7px] text-[#888c94]">Play Time: 07min 15secs</span>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-white">View results</span>
            <ChevronUp size={8} className="text-white" />
          </div>
        </div>

        {/* Q&A rows */}
        <div className="rounded-b overflow-hidden" style={{ background: '#000' }}>
          {QA_RESULTS.map(({ q, question, correct, ans, time }, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-2 border-b border-white/5 last:border-0"
              style={{ background: '#18181a' }}
            >
              <span className="text-[7px] text-white shrink-0 w-5">{q}</span>
              <span className="text-[7px] text-white flex-1 leading-[10px]">{question}</span>
              {correct ? (
                <Check size={7} className="text-green-400 shrink-0 mt-0.5" />
              ) : (
                <X size={7} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="text-[7px] text-[#888c94] shrink-0">{ans}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <Clock size={6} className="text-[#888c94]" />
                <span className="text-[7px] text-[#888c94]">{time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
