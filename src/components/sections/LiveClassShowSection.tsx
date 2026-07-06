'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import RedDotIcon from '@/components/icons/RedDotIcon';
import Link from 'next/link';


const FormField = ({ label, icon, value, hasDropdown }: { label: string; icon: string; value: string; hasDropdown?: boolean }) => (
  <div className="flex flex-col gap-[2.91px]">
    <label className="text-[11.62px] text-text-primary font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
      {label}
    </label>
    <div className="flex items-center gap-[8.72px] px-[12px] py-[10px] rounded-[4px] bg-[rgba(234,234,234,0.06)] backdrop-blur-[43.58px]">
      <Image src={icon} alt="" width={13} height={13} className="w-[13px] h-[13px] flex-shrink-0" />
      <span className="text-[10.17px] text-[#eaeaea] font-semibold flex-1 leading-[10.17px]">
        {value}
      </span>
      {hasDropdown && <Image src="/icons/chevron-down.svg" alt="" width={7} height={6} className="w-[7px] h-[6px] flex-shrink-0" />}
    </div>
  </div>
);

const ControlButton = ({ icon, label, active }: { icon: string; label: string; active?: boolean }) => (
  <div className="flex flex-col items-center gap-[2.91px]">
    <div className={`w-[29px] h-[29px] rounded-full flex items-center justify-center ${active ? 'bg-primary' : 'bg-[rgba(63,177,214,0.12)]'}`}>
      <Image src={icon} alt="" width={13} height={11} className="w-[13px] h-[11px]" />
    </div>
    <span className="text-[8.72px] font-medium text-text-gray leading-[8.72px] tracking-[0.04px]">
      {label}
    </span>
  </div>
);

export const LiveClassShowSection = memo(() => (
  <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden ">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-0">
        
        {/* Left: Text Content */}
        <div className="flex flex-col gap-12 sm:gap-[60px] w-full lg:w-1/2 lg:pr-12">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="text-[40px] leading-[50px] sm:text-[56px] sm:leading-[70px] lg:text-[64px] lg:leading-[80px] font-extrabold gradient-purple-cyan">
                Schedule or Join
              </h2>
              <div className="flex items-center gap-4 sm:gap-6">
                <Image src="/icons/red-dot.svg" alt="" width={25} height={25} className="w-[18px] h-[18px] sm:w-[25px] sm:h-[25px]" />
                <h2 className="text-[40px] leading-[50px] sm:text-[56px] sm:leading-[70px] lg:text-[64px] lg:leading-[80px] font-extrabold text-text-primary">
                  Live Classes
                </h2>
              </div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-medium text-text-primary max-w-[600px] leading-relaxed">
              Attend real-time sessions with instructors, ask questions, and learn alongside other students.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold text-white">
              <Link href="/signup">
              Create events
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">

               <Link href="/signup">
              How it works
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Live Class Preview - Full Width on Desktop */}
        <div className="w-full lg:w-1/2 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 flex items-center">
          <div 
            className="w-full rounded-[16px] lg:rounded-l-[20px] lg:rounded-r-none p-6 sm:p-8 lg:p-10 flex flex-col gap-6 sm:gap-[29.05px] lg:pr-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]"
            style={{
              background: 'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636'
            }}
          >
            
            {/* Header */}
            <div className='p-3 rounded-lg'
            style={{
              background: 'rgba(31, 38, 54, 1)'

            }}>

            
            <div className="flex items-center gap-[7.26px]">
              <Image src="/icons/arrow-left.svg" alt="" width={13} height={10} className="w-[13px] h-[10px] flex-shrink-0" />
              <h3 className="text-[18px] sm:text-[23.24px] font-medium text-text-primary leading-tight">
                Join Class - Digital Marketing for Beginners
              </h3>
            </div>

            {/* Content */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-[29.05px]">
              
              {/* Left: Video Preview */}
              <div className="flex flex-col gap-[11.62px] flex-1">
                {/* Posted Badge */}
                <div className="flex items-center gap-[4.36px]">
                  <Image src="/icons/profile-users.svg" alt="" width={15} height={15} className="w-[15px] h-[15px] flex-shrink-0" />
                  <span className="text-[8.72px] text-text-gray font-normal leading-[8.72px]">
                    Attendee invite
                  </span>
                </div>
                
                {/* Date/Time */}
                <p className="text-[10.17px] text-text-gray font-normal leading-[10.17px]">
                  Saturday, Dec 6 2:50 PM–3:50 PM GMT+1
                </p>
                
                {/* Thumbnail Container */}
                <div className="rounded-[10px] bg-[rgba(106,87,229,0.06)] p-[9.96px] flex flex-col gap-[9.96px]">
                  <div className="relative w-full aspect-[371/237] rounded-[8px] overflow-hidden">
                    <Image src="/images/live-class-preview.jpg" alt="Video preview" fill className="object-cover" />
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center gap-[6.23px] justify-center">
                    <ControlButton icon="/icons/video-on.svg" label="Video on" active />
                    <ControlButton icon="/icons/mic-off.svg" label="Mic off" />
                    <ControlButton icon="/icons/volume-high.svg" label="Speaker" active />
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="flex flex-col gap-[17.43px] flex-1">
                <FormField label="Name" icon="/icons/user-icon.svg" value="Gracious Kingsley"  />
                <FormField label="Camera" icon="/icons/video-gray.svg" value="Realtek (V) Video" hasDropdown />
                <FormField label="Microphone" icon="/icons/video-gray.svg" value="Microphone Array (Intel smart 3024c)" hasDropdown />
                <FormField label="Speaker" icon="/icons/speaker-icon.svg" value="Spatial sound system" hasDropdown />
              
                {/* Join Now Button */}
                <button 
                  className="mt-2 flex items-center justify-center gap-[5.81px] px-6 py-3 rounded-full border-[0.87px] border-[rgba(234,234,234,0.2)] bg-[rgba(106,87,229,0.01)] hover:bg-[rgba(106,87,229,0.05)] transition-all"
                  style={{
                    boxShadow: 'inset 1.45px 1.45px 2.9px rgba(255, 255, 255, 0.30)'
                  }}
                >
                <RedDotIcon width={24} height={24} className="sm:w-[43px] sm:h-[43px] text-red-600 animate-pulse" />
                  <span className="text-[11.62px] font-bold text-[rgba(229,229,229,0.95)] leading-tight">
                    Join Now
                  </span>
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));

LiveClassShowSection.displayName = 'LiveClassShowSection';
