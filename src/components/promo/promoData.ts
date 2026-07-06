export const PROMO = {
  headline: 'Life Changing Opportunity.',
  bodyParts: ['# Hallos Millionaires Retreat 2026'] as string[],
  limitedOffer: 'LIMITED SLOTS AVAILABLE',
  cta: 'Share & Invite Friends',
} as const;

export async function handleShare() {
  const eventUrl = 'https://www.hallos.net/dashboard/events';
  const shareData = {
    title: PROMO.headline,
    text: PROMO.bodyParts.join(''),
    url: eventUrl,
  };

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share(shareData);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    }
  } catch {
    // User cancelled or clipboard failed — silent
  }
}
