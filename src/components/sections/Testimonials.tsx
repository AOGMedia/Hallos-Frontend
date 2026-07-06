
import { StaggerTestimonials } from '@/components/ui/StaggerTestimonials';


export function Testimonials() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-6xl font-extrabold text-center mb-8 sm:mb-12 leading-tight px-4 sm:px-0">
          Over <span className="gradient-text">5k</span> learners and creators <br /> love <span className="gradient-text">Hallos</span>
        </h2>
        
        {/* Interactive Stagger Testimonials */}
        <div className="mb-16">
          <StaggerTestimonials />
        </div>
        
        
      </div>
    </section>
  );
}