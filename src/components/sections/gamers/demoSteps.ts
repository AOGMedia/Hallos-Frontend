/**
 * The steps of the landing-page quiz demo, in order. Each one is a caption
 * beside the phone and an animated screen inside it (see DemoScreens). Add a
 * step by adding an entry here and a screen with the same `id`.
 *
 * The rules described match the real game (backend lobbyService,
 * tournamentService and quizWalletService): 10 questions, 10 seconds each,
 * points by difficulty plus a speed bonus within 5 seconds, both wagers held
 * until the match ends and the winner takes them, withdrawals from 1,000
 * Chuta with a 10% fee. Keep them in step if those change.
 */

export type DemoStepId = 'challenge' | 'accept' | 'answer' | 'win' | 'cashout' | 'tournaments';

export interface DemoStep {
  id: DemoStepId;
  title: string;
  text: string;
  /** How long the step plays before moving on (ms). Its screen's animation fits inside it. */
  durationMs: number;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'challenge',
    title: 'Challenge a player',
    text: 'Pick an opponent and a topic, then put some Chuta on the line.',
    durationMs: 4400,
  },
  {
    id: 'accept',
    title: 'Lock in the wagers',
    text: 'When they accept, both wagers are held until the match ends. Then the countdown starts.',
    durationMs: 3600,
  },
  {
    id: 'answer',
    title: 'Answer fast',
    text: '10 questions, 10 seconds each. Right answers score points, and answers within 5 seconds earn a speed bonus.',
    durationMs: 7400,
  },
  {
    id: 'win',
    title: 'Win the pot',
    text: 'The higher score takes both wagers.',
    durationMs: 4200,
  },
  {
    id: 'cashout',
    title: 'Cash out',
    text: 'Move your Chuta to your Hallos wallet once you have 1,000 or more. A 10% fee applies.',
    durationMs: 4600,
  },
  {
    id: 'tournaments',
    title: 'Go bigger in tournaments',
    text: 'Classic, Speed Run, Battle Royale and Knockout. Or host your own for your learners.',
    durationMs: 4600,
  },
];
