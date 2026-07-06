import { Button } from '@/components/ui/Button';
import GoogleIcon from '@/components/icons/GoogleIcon';
import AppleIcon from '@/components/icons/AppleIcon';
import FacebookIcon from '@/components/icons/FacebookIcon';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="bg-background-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col items-center gap-6 sm:gap-8">
          <h2 className="text-2xl sm:text-3xl lg:text-6xl font-extrabold text-center max-w-5xl leading-tight">
            Join over 5K learners or 1k creators on <span className="gradient-text">Hallos</span> <span className="gradient-text">today</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/signup">
                Get Started
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full bg-background-darker border border-border flex items-center justify-center hover:border-text-primary transition-colors">
                <GoogleIcon width={24} height={25} />
              </button>
              
              <button className="w-12 h-12 rounded-full bg-background-darker border border-border flex items-center justify-center hover:border-text-primary transition-colors">
                <AppleIcon width={24} height={30} />
              </button>
              
              <button className="w-12 h-12 rounded-full bg-background-darker border border-border flex items-center justify-center hover:border-text-primary transition-colors">
                <FacebookIcon width={12} height={24} color="#5099F8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}