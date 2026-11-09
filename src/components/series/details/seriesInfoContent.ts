import { BellRing, CalendarDays, MessagesSquare, Radio, Wallet, type LucideIcon } from "lucide-react";

/**
 * The wording of the series page's info tabs — the same for every series.
 * Each line describes what the product actually does (purchase flow, gateways, email reminders), so keep it in step with
 * SeriesPricingCard, SessionList and the backend's reminder job.
 */

export interface InfoStep {
  title: string;
  text: string;
}

export interface InfoPoint {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface SeriesInfoFacts {
  isFree: boolean;
  hasAccess: boolean;
  isRegistered: boolean;
  /** The room has chat, reactions and raised hands (GetStream series). */
  interactive: boolean;
}

export function howToJoinSteps({ isFree, hasAccess, isRegistered }: SeriesInfoFacts): InfoStep[] {
  const getYourSpot: InfoStep | null =
    isFree && !isRegistered
      ? {
          title: "Secure your spot",
          text: "Tap Secure My Spot. If you aren't signed in yet, we'll ask you to sign in first.",
        }
      : !isFree && !hasAccess
        ? {
            title: "Get your spot",
            text: "Tap Purchase Series and complete your payment. The How to pay tab walks you through it.",
          }
        : null;

  return [
    ...(getYourSpot ? [getYourSpot] : []),
    {
      title: "Watch for your reminder",
      text: "We'll email you about an hour before each session starts.",
    },
    {
      title: "Join when it goes live",
      text: "Come back to this page and tap Join Now on that session in the Sessions list. The button appears once the session has started.",
    },
  ];
}

export const HOW_TO_PAY_STEPS: InfoStep[] = [
  {
    title: "Choose your currency",
    text: "Pick NGN or USD on the price card.",
  },
  {
    title: "Add a coupon if you have one",
    text: "Enter your code in the coupon box and tap Apply. You'll see the new price before you pay.",
  },
  {
    title: "Tap Purchase Series",
    text: "If you aren't signed in yet, we'll ask you to sign in first, then bring you back here.",
  },
  {
    title: "Finish on the secure checkout",
    text: "The checkout page opens: Paystack for NGN, Stripe for USD. Complete your payment there.",
  },
  {
    title: "You're in",
    text: "Come back to this page. It will show Purchased, and that one payment covers every session in the series.",
  },
];

export const HOW_TO_PAY_NOTE =
  "Already paid but still seeing the Purchase button? Tap “Click here to verify your access” just below it.";

export function whyThisSeriesPoints({ isFree, interactive }: SeriesInfoFacts): InfoPoint[] {
  return [
    {
      icon: Radio,
      title: "Learn live with your instructor",
      text: "Every session happens in real time, taught directly by the person leading the series.",
    },
    ...(interactive
      ? [
          {
            icon: MessagesSquare,
            title: "Take part, don't just watch",
            text: "Ask in the chat, react and raise your hand during the session.",
          },
        ]
      : []),
    {
      icon: CalendarDays,
      title: "A set schedule",
      text: "Every session is listed on this page with its date and time, so you always know when the next one is.",
    },
    isFree
      ? { icon: Wallet, title: "Free to join", text: "There's nothing to pay. Secure your spot and you're in." }
      : { icon: Wallet, title: "One payment, every session", text: "You pay once for the whole series, not per session." },
    {
      icon: BellRing,
      title: "A reminder before each session",
      text: "We email you about an hour before, so you don't miss it.",
    },
  ];
}
