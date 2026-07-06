
import Image from 'next/image';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import { ComponentType } from 'react';

interface SocialLink {
  name: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}

interface FooterLink {
  label: string;
  href: string;
}

// TikTok icon component (not available in Lucide)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

// X (Twitter) icon component (not available in Lucide)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://web.facebook.com/profile.php?id=61573028903471',
    icon: Facebook
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/learning247live/',
    icon: Instagram
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@learning247live?lang=en',
    icon: TikTokIcon
  },
  {
    name: 'X',
    url: 'https://x.com/Learning247Live',
    icon: XIcon
  },
  {
    name: 'WhatsApp',
    url: 'https://whatsapp.com/channel/0029VbAuQCzGpLHXVDV17t3u',
    icon: WhatsAppIcon
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/106357438/',
    icon: Linkedin
  }
];

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Investor Relations', href: '/investor-relations' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact', href: '/contact' }
];

const COMPANY_INFO = {
  name: 'Hallos',
  description: 'Empowering creators to share their knowledge and passion with the world through live and interactive classes.',
  copyright: '©  2026 Hallos Inc. All rights reserved.'
};

const SocialIcon = ({ social }: { social: SocialLink }) => {
  const IconComponent = social.icon;
  
  return (
    <a 
      href={social.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
      aria-label={`Follow us on ${social.name}`}
    >
      <IconComponent className="w-5 h-5 text-gray-300" />
    </a>
  );
};

const Logo = () => (
  <div className="flex items-center justify-center">
    <Image 
      src="/transparentlogo.svg" 
      alt={COMPANY_INFO.name}
      width={200} 
      height={60}
      className="h-12 w-auto"
    />
  </div>
);

export function Footer() {
  return (
    <footer className="">
      {/* Main footer section with black background */}
      <div className=" py-16 px-4">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-8">
          <Logo />
          
          <p className="text-gray-300 text-center max-w-2xl text-base leading-relaxed">
            {COMPANY_INFO.description}
          </p>
          
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <SocialIcon key={social.name} social={social} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom gradient bar */}
      <div 
        className="w-full py-4 px-4"
        style={{
          background: 'linear-gradient(90deg, #6A57E5 0%, #8EF1FF 75.96%)',
        }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <p className="text-sm font-normal text-white text-center sm:text-left">
            {COMPANY_INFO.copyright}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="text-sm font-bold text-black  hover:opacity-80 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}