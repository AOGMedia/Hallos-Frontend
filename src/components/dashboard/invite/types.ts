export interface LiveSeriesHost {
  name: string;
  avatar: string;
}

export interface LiveSeriesTime {
  start: string;
  end: string;
}

export interface LiveSeriesPrice {
  amount: string;
  currency: string;
}

export interface LiveSeriesCountdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface SeriesPricing {
  base: {
    amount: number;
    currency: string;
  };
  ngn: number;
  usd: number;
}

export interface LiveSeriesData {
  id: string;
  className: string;
  thumbnail: string;
  host: LiveSeriesHost;
  isLive: boolean;
  title: string;
  description: string;
  price: LiveSeriesPrice;
  pricing?: SeriesPricing; // New dual currency pricing structure
  date: string;
  time: LiveSeriesTime;
  attendeeCount: string;
  countdown: LiveSeriesCountdown;
}
