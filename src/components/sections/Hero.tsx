import { Button } from "@/components/ui/Button";
import { CreatorTourButton } from "@/components/tour/CreatorTourButton";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 px-4 sm:px-6 lg:px-10 overflow-hidden">
      {/* Gradient blur effect */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[150px] sm:h-[209px] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(50% 50% at 52.82% 50%, #4B7CE3 0%, #154CC2 100%)",
          filter: "blur(143.54px)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col gap-[60px] w-full lg:w-auto lg:flex-1">
            {/* Texts */}
            <div className="flex flex-col gap-4 pt-14">
              <h1 className="text-[32px] leading-[40px] sm:text-[48px] sm:leading-[60px] lg:text-[64px] lg:leading-[80px] font-extrabold text-text-primary">
                Learn Live,{" "}
                <span className="gradient-text">from

                <br className="hidden sm:block" /> the Best
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-[20px] lg:leading-[30px] font-medium text-text-primary max-w-[600px]">
                Discover interactive live classes from creators around the
                world. Engage, learn, and grow your skills in real-time.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto text-base font-bold"
              >
                <a href="#searchSection">Explore Classes</a>
              </Button>
              <CreatorTourButton className="w-full sm:w-auto" />
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-auto lg:flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] aspect-square">
              <Image
                src="/images/hero-student.svg"
                alt="Student learning with headphones"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
