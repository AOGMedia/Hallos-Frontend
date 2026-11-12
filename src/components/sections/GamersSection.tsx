'use client';

import { GamersHero } from './gamers/GamersHero';
import { QuizDemo } from './gamers/QuizDemo';
import { GamerButton } from './gamers/GamerButton';

export function GamersSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 w-full" aria-label="Hallos Hub for Gamers">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-10 sm:gap-14">
        <GamersHero />

        {/* How a quiz match works, as a short animated walkthrough */}
        <QuizDemo />

        <div className="flex flex-wrap justify-center gap-3">
          <GamerButton label="Play now" variant="solid" href="/dashboard/games" />
          <GamerButton label="Host a tournament" variant="outline" href="/dashboard/games" />
        </div>
      </div>
    </section>
  );
}
