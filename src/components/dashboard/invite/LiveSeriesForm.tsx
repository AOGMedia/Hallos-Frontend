import { useState } from "react";
import Image from "next/image";
import type { LiveSeriesData } from "./types";

interface LiveSeriesFormProps {
  series: LiveSeriesData;
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="3" width="18" height="17" rx="3" stroke="#EAEAEA" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M1 8H19" stroke="#EAEAEA" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M6 1V5" stroke="#EAEAEA" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 1V5" stroke="#EAEAEA" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6.5" cy="13.5" r="1" fill="#EAEAEA" fillOpacity="0.5" />
      <circle cx="10" cy="13.5" r="1" fill="#EAEAEA" fillOpacity="0.5" />
      <circle cx="13.5" cy="13.5" r="1" fill="#EAEAEA" fillOpacity="0.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 1L6 6L11 1"
        stroke="#EAEAEA"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LiveSeriesForm({ series }: LiveSeriesFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine if series is free
  const isFree = series.pricing ? (series.pricing.ngn === 0 && series.pricing.usd === 0) : false;

  // Get price for selected currency
  const getDisplayPrice = () => {
    if (isFree) return '0.00';
    
    if (series.pricing) {
      const amount = selectedCurrency === 'NGN' ? series.pricing.ngn : series.pricing.usd;
      return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    
    // Fallback to old price format
    return series.price.amount;
  };

  return (
    <div className="flex flex-col gap-6 flex-1 min-w-0">
      {/* Class Name */}
      <div className="flex flex-col gap-1">
        <label className="live-event-label">{`Class Name`}</label>
        <div className="settings-input-field">
          <span
            className="font-['Plus_Jakarta_Sans'] text-sm font-semibold"
            style={{ color: "#eaeaea" }}
          >
            {series.className}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1">
        <label className="live-event-label">{`Price`}</label>
        <div
          className="settings-input-field"
          style={{
            boxShadow: "0px 0px 4px 2px rgba(106, 87, 229, 0.80)",
            background: "rgba(234, 234, 234, 0.01)",
          }}
        >
          {/* Currency selector with dropdown */}
          <div className="relative flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span
                className="font-['Plus_Jakarta_Sans'] text-sm font-semibold"
                style={{ color: "#eaeaea" }}
              >
                {selectedCurrency}
              </span>
              <ChevronDownIcon />
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-black border border-border rounded-md shadow-lg z-10 min-w-[80px]">
                {(['NGN', 'USD'] as const).map((currency) => (
                  <button
                    key={currency}
                    onClick={() => {
                      setSelectedCurrency(currency);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-background-dark transition-colors ${
                      selectedCurrency === currency ? 'text-primary font-semibold' : 'text-text-muted'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            className="w-px self-stretch shrink-0"
            style={{ background: "rgba(234,234,234,0.15)" }}
          />

          {/* Amount */}
          <span
            className="font-['Plus_Jakarta_Sans'] text-sm font-semibold flex-1"
            style={{ color: "#eaeaea" }}
          >
            {getDisplayPrice()}
          </span>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex flex-col gap-4">
        <label className="live-event-label">{`Date & Time`}</label>

        {/* Date input */}
        <div className="settings-input-field justify-between">
          <span
            className="font-['Plus_Jakarta_Sans'] text-sm font-semibold"
            style={{ color: "#eaeaea" }}
          >
            {series.date}
          </span>
          <CalendarIcon />
        </div>

        {/* Time row */}
        <div className="flex items-center gap-3">
          {/* Start time */}
          <div className="settings-input-field flex-1 justify-between">
            <span
              className="font-['Plus_Jakarta_Sans'] text-sm font-semibold"
              style={{ color: "#eaeaea" }}
            >
              {series.time.start}
            </span>
            <Image
              src="/icons/clock.svg"
              alt="clock"
              width={22}
              height={22}
              className="opacity-50 shrink-0"
            />
          </div>

          <span
            className="font-['Plus_Jakarta_Sans'] text-sm font-semibold shrink-0"
            style={{ color: "rgba(234,234,234,0.5)" }}
          >
            To
          </span>

          {/* End time */}
          <div className="settings-input-field flex-1 justify-between">
            <span
              className="font-['Plus_Jakarta_Sans'] text-sm font-semibold"
              style={{ color: "#eaeaea" }}
            >
              {series.time.end}
            </span>
            <Image
              src="/icons/clock.svg"
              alt="clock"
              width={22}
              height={22}
              className="opacity-50 shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
