import Image from "next/image";
import { Button } from "@/components/ui/Button";
import UserAddIcon from "@/components/icons/UserAddIcon";
import { Info } from "lucide-react";

interface EventHeroCardProps {
  title: string;
  description: string;
  eventImage: string;
  backgroundImage: string;
  qrCodeImage: string;
  onRegister?: () => void;
  onLearnMore?: () => void;
}

export function EventHeroCard({
  title,
  description,
  eventImage,
  backgroundImage,
  qrCodeImage,
  onRegister,
  onLearnMore,
}: EventHeroCardProps) {
  return (
    <div className="relative event-hero-gradient overflow-hidden w-full h-[400px] sm:h-[520px] shadow-md  "
    style={{backgroundImage:`url('/images/event/enuguskyline.png')` , backgroundSize: 'cover', backgroundPosition: 'center'}}>
      {/* Background logo */}
      <div className="absolute flex justify-center top-6 right-6 sm:top-10 sm:right-60 z-10 mx-auto">
        <Image
          src={backgroundImage}
          alt="Learning247 Logo"
          width={120}
          height={30}
          // fill
          className="w-[100px] sm:w-[162px] h-auto"
        />
      </div>

      {/* Event image */}
      <div className="absolute inset-0 ">
        <Image
          src={eventImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#3C2F91]/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
        {/* Title and description */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 mt-12 sm:mt-16 justify-center">
          <h2 className="event-title-large text-2xl sm:text-[40px]">{title}</h2>
          <p className="text-description text-xs sm:text-sm max-w-[280px] sm:max-w-[293px] text-center">
            {description}
          </p>
        </div>

        {/* Bottom section with buttons and QR */}
        <div className="flex items-end justify-between gap-4 ">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={onRegister}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4"
            >
              <UserAddIcon width={20} height={18} color="#ffffff" />
              <span className="text-sm sm:text-base">Register</span>
            </Button>

            <button
              onClick={onLearnMore}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-full border border-white/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              style={{
                boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.3)",
              }}
            >
              <span className="text-sm sm:text-base font-bold text-text-secondary  ">
                <Info
                  width={20}
                  height={20}
                  color="rgba(229, 229, 229, 0.95)"
                />
              </span>
              Learn more
            </button>
          </div>

          {/* QR Code */}
          <div className=" sm:block">
            <Image
              src={qrCodeImage}
              alt="Event QR Code"
              width={80}
              height={80}
              className="rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
