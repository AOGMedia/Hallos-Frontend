"use client";

import { useState } from "react";
// import { CountdownTimer } from './CountdownTimer';
import { EventDetailsCard } from "./EventDetailsCard";
import { EventHeroCard } from "./EventHeroCard";
import { RegistrationModal } from "./RegistrationModal";
import RedDotIcon from "@/components/icons/RedDotIcon";
import type { EventSectionProps } from "./types";

export function EventSection({
  // eventDate,
  eventTitle,
  eventLocation,
  eventDescription,
  eventImage,
  backgroundImage,
  qrCodeImage,
}: EventSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegister = () => {
    setIsModalOpen(true);
  };

  const handleLearnMore = () => {
    // TODO: Implement learn more logic
    console.log("Learn more clicked");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16 mt-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Section */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div className="flex flex-col gap-0">
              <h2 className="heading-hero text-3xl sm:text-2xl  lg:text-[64px] leading-tight sm:leading-tight lg:leading-[80px]">
                {eventTitle}
              </h2>
              <div className="flex items-center gap-6 sm:gap-8">
                <h3 className="gradient-purple-cyan heading-hero text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-tight lg:leading-[80px]">
                  Live in Enugu
                </h3>
                <RedDotIcon
                  width={24}
                  height={24}
                  className="sm:w-[43px] sm:h-[43px] text-red-600 animate-pulse"
                />
              </div>
            </div>

            {/* Event Details Card */}
            <EventDetailsCard
              date="12 Feb, 2026"
              time="10:00 am"
              location={eventLocation}
            />

            {/* Countdown Timer */}
            {/* <CountdownTimer targetDate={eventDate} /> */}
            

          </div>

          {/* Right Section - Hero Card */}
          <div className="w-full">
            <EventHeroCard
              title={eventTitle}
              description={eventDescription}
              eventImage={eventImage}
              backgroundImage={backgroundImage}
              qrCodeImage={qrCodeImage}
              onRegister={handleRegister}
              onLearnMore={handleLearnMore}
            />
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  );
}
