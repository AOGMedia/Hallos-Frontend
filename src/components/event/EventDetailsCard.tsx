import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import LocationPinIcon from '@/components/icons/LocationPinIcon';

interface EventDetailsCardProps {
  date: string;
  time: string;
  location: string;
}

export function EventDetailsCard({ date, time, location }: EventDetailsCardProps) {
  return (
    <div className="event-details-card flex-col sm:flex-row items-start sm:items-center justify-between w-full">
      <div className="flex flex-col gap-3 items-center min-w-[120px] sm:min-w-[40px]">
        <CalendarIcon width={24} height={24} color="#6A57E5" />
        <span className="text-body text-sm sm:text-base text-center lg:truncate">{date}</span>
      </div>
      
      <div className="flex flex-col gap-3 items-center min-w-[120px] sm:min-w-[190px]">
        <ClockIcon width={24} height={24}  className='' />
        <span className="text-body text-sm sm:text-base text-center">{time}</span>
      </div>
      
      <div className="flex flex-col gap-3 items-start   md:items-center min-w-[120px] sm:min-w-[190px]">
        <LocationPinIcon width={24} height={24} color="#6A57E5" className='ml-12 md:ml-0' />
        <span className="text-body text-sm sm:text-base text-center leading-6">{location}</span>
      </div>
    </div>
  );
}