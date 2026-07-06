'use client';

import { GamersHero } from './gamers/GamersHero';
import { FeatureRow } from './gamers/FeatureRow';
import { GameLobbyMockup } from './gamers/mockups/GameLobbyMockup';
import { VictoryMockup } from './gamers/mockups/VictoryMockup';
import { TournamentMockup } from './gamers/mockups/TournamentMockup';

export function GamersSection() {
  return (
    <section
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 w-full"
      style={{
        background:
          'linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%)',
      }}
      aria-label="Hallos Hub for Gamers"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
        {/* Heading */}
        <GamersHero />

        {/* Row 1 – Game Lobby (left) | Text (right) */}
        <FeatureRow
          heading="Join thousands of players in real-time battles. Choose your specialty and climb the leader board to earn amazing prizes"
          buttons={[{ label: 'Get Started', variant: 'outline', href: '/dashboard/games' }]}
        >
          <GameLobbyMockup />
        </FeatureRow>

        {/* Row 2 – Text (left) | Victory screen (right) */}
        <FeatureRow
          reversed
          heading="Win points, unlock achievements, and redeem exciting prizes as you play and learn."
          buttons={[{ label: 'Play Now', variant: 'outline', href: '/dashboard/games' }]}
        >
          <VictoryMockup />
        </FeatureRow>

        {/* Row 3 – Tournament (left) | Text (right) */}
        <FeatureRow
          heading="Create competitive quiz events for your learners, grow your community, and reward top performers — all in one place."
          buttons={[
            // { label: 'How it works', variant: 'outline' },
            { label: 'Get Started', variant: 'solid', href: '/dashboard/games' },
          ]}
        >
          <TournamentMockup />
        </FeatureRow>
      </div>
    </section>
  );
}
