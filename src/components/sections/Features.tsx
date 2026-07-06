import { Card } from '@/components/ui/Card';
import BookIcon from '@/components/icons/BookIcon';
import LinkIcon from '@/components/icons/LinkIcon';
import SparkleIcon from '@/components/icons/SparkleIcon';

const FEATURES = [
  {
    icon: BookIcon,
    title: 'Expert Creators',
    description: 'Learn from industry professionals and passionate experts in their fields.',
  },
  {
    icon: LinkIcon,
    title: 'Interactive Sessions',
    description: 'Learn from industry professionals and passionate experts in their fields.',
  },
  {
    icon: SparkleIcon,
    title: 'Flexible Learning',
    description: 'Learn from industry professionals and passionate experts in their fields.',
  },
];

export function Features() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight">
            Why choose <span className="gradient-text">Hallos?</span>
          </h2>
          <p className="text-body mt-4 text-sm sm:text-base px-4 sm:px-0">
            We offer a unique, interactive learning experience that sets us apart
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} variant="feature" className="flex flex-col items-center text-center gap-4 p-6">
                <div className='bg-[#6A57E51A] p-3 rounded-full'>

                <Icon width={20} height={20} color="#6A57E5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">{feature.title}</h3>
                <p className="text-body text-sm sm:text-base">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}